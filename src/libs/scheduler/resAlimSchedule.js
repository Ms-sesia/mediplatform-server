import { PrismaClient } from "@prisma/client";
import schedule from "node-schedule";

const prisma = new PrismaClient();

export default async () => {
  // 초 분 시 일 월 요일(0-7, 0 or 7 is sun)
  // 매일 오전 9시
  schedule.scheduleJob("0 0 9 * * *", async () => {
    try {
      const calTimeMs = 1000 * 60 * 60 * 9; // 한국시간 GMT+9 에 맞추기 위한 +9

      // 연동 기획 추가 필요
      const templateCode = "0139d6202c40c484a9e56936a9765b";

      let findAlimRes = new Array();

      // 알림 보내야 하는 예약
      for (let i = 0; i < 3; i++) {
        const oneDate = new Date(new Date().setDate(new Date().getDate() + i));

        const where = {
          AND: [
            { re_year: oneDate.getFullYear() },
            { re_month: oneDate.getMonth() + 1 },
            { re_date: oneDate.getDate() },
            {
              resAlim:
                i === 0
                  ? { ra_time4: true } // 당일
                  : i === 1
                  ? { ra_time2: true } // 1일 전
                  : { ra_time3: true }, // 2일 전
            }, //
            { re_status: "confirm" }, // 예약 확정
          ],
        };

        const res = await prisma.reservation.findMany({
          where,
          include: {
            resAlim: {
              select: {
                ra_type: true,
                ra_templateId: true,
              },
            },
            hospital: {
              select: {
                hsp_email: true,
                hsp_phone: true,
                hsp_messageTrId: true,
                hsp_messageSendNum: true,
                hsp_name: true,
              },
            },
          },
        });

        findAlimRes.push(...res);
      }

      let message;
      findAlimRes.forEach(async (far) => {
        const cellphone = far.re_patientCellphone;

        console.log("보낼 폰번호: ", cellphone);
        console.log("템플릿 type: ", far.resAlim.ra_type);
        console.log("템플릿 id: ", far.resAlim.ra_templateId);

        const template =
          far.resAlim.ra_templateId === 0
            ? process.env.DEFAULT_SMS_MESSAGE
            : (await prisma.resAlimTemplate.findUnique({ where: { rat_id: far.resAlim.ra_templateId } })).rat_text;

        if (far.resAlim.ra_type === "sms") {
          const offsetTime = new Date().getTime() + calTimeMs;
          const sendTime = new Date(offsetTime).toISOString();

          message = `${template
            .replace("{병원명}", far.hospital.hsp_name)
            .replace("{환자명}", far.re_patientName)
            .replace(
              "{예약일}",
              new Date(new Date(far.re_resDate).setHours(new Date(far.re_resDate).getHours() + 9))
                .toISOString()
                .split("T")[0]
            )
            .replace("{예약시간}", far.re_time)}`;

          sendSMS(
            sendTime,
            message,
            cellphone,
            far.re_patientName,
            false,
            far.hospital.hsp_messageTrId,
            far.hospital.hsp_messageSendNum
          );
          console.log(`${cellphone}로 문자 전송 완료.`);
        }

        if (far.resAlim.ra_type === "kakao") {
          const intFormatCellphone = toInternationalFormat(cellphone);

          const tokenInfo = (
            await axios.post(
              process.env.INFO_KAKAO_TOKENURL,
              {},
              {
                headers: {
                  "X-IB-Client-Id": process.env.KAKAO_ID,
                  "X-IB-Client-Passwd": process.env.KAKAO_PW,
                  "Content-Type": "application/json;charset=UTF-8",
                  Accept: "application/json",
                },
              }
            )
          ).data;

          const drName =
            far.re_doctorRoomId !== 0
              ? (
                  await prisma.doctorRoom.findUnique({
                    where: { dr_id: far.re_doctorRoomId },
                  })
                ).dr_doctorName
              : "담당의";

          const time = `${
            new Date(new Date(far.re_resDate).setHours(new Date(far.re_resDate).getHours() + 9))
              .toISOString()
              .split("T")[0]
          } ${far.re_time}`;

          message = `${template
            .replace("#{환자명}", far.re_patientName)
            .replace("#{병원명}", far.hospital.hsp_name)
            .replace("#{시간}", time)
            .replace("#{진료의명}", drName)
            .replace("#{문의 전화번호}", far.hospital.hsp_phone)
            .replace("#{url}", far.hospital.hsp_email)}
            `;

          await kakaoSend(tokenInfo, intFormatCellphone, templateCode, message);

          console.log(`${cellphone} 알림톡 전송 완료.`);
        }
      });

      return true;
    } catch (e) {
      console.log("test error =>", e);
      if (e.errorCode === 1) console.log("정확하지 않은 핸드폰번호는 카카오톡 발송이 불가능합니다.", e);
    }
  });
};

const kakaoSend = async (tokenInfo, cellphone, templateCode, template) => {
  try {
    const kakaoSendBody = {
      msg_type: "AL",
      mt_failover: "N",
      msg_data: {
        to: cellphone,
        content: template,
      },
      msg_attr: {
        sender_key: process.env.INFO_KAKAO_SENDERKEY,
        template_code: templateCode,
        response_method: "push",
        attachment: {
          button: [
            {
              name: "채널 추가",
              type: "AC",
            },
          ],
        },
      },
    };

    const sendResData = await axios.post(process.env.INFO_KAKAO_MSGSENDURL, kakaoSendBody, {
      headers: {
        Authorization: `${tokenInfo.schema} ${tokenInfo.accessToken}`,
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
    });

    console.log("kakao alim talk 전송 결과 :", sendResData.data);
  } catch (e) {
    console.log("kakao alim talk 전송 에러. =>", e);
  }
};

// 핸드폰번호 유효성 검사
const checkPhone = (number) => {
  // 한국 핸드폰 번호 패턴 (010으로 시작하며 총 11자리 숫자)
  const pattern = /^010\d{8}$/;
  return pattern.test(number);
};

// 국제번호로 변환
const toInternationalFormat = (number) => {
  // '010' 접두어를 제거하고, '82'를 앞에 추가
  if (checkPhone(number)) {
    return "82" + number.substring(1);
  } else {
    throw { errorCode: 1, number };
  }
};

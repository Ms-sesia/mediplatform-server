import { PrismaClient } from "@prisma/client";
import schedule from "node-schedule";
import { toInternationalFormat } from "../checkValidation";
import { getAlimTalkToken, sendAlimTalk } from "../infoKakaoAlim/alimtalk";
import sendSMS from "../sendSMS";

const prisma = new PrismaClient();

export default async () => {
  // 초 분 시 일 월 요일(0-7, 0 or 7 is sun)
  // 매일 오전 9시
  schedule.scheduleJob("0 0 9 * * *", async () => {
    try {
      const today = new Date(new Date().setDate(new Date().getDate() + 9));
      console.log(`${today.toISOString().split("T")[0]}, 오전 9시. 예약 알림 스케쥴러 진행.`);
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

        const template =
          far.resAlim.ra_templateId === 0
            ? process.env.DEFAULT_SMS_MESSAGE
            : (await prisma.resAlimTemplate.findUnique({ where: { rat_id: far.resAlim.ra_templateId } })).rat_text;

        if (far.resAlim.ra_type === "sms") {
          const offsetTime = new Date().getTime() + calTimeMs;
          const sendTime = new Date(offsetTime).toISOString();

          message = `${template
            .replace("#{병원명}", far.hospital.hsp_name)
            .replace("#{환자명}", far.re_patientName)
            .replace(
              "#{예약일}",
              new Date(new Date(far.re_resDate).setHours(new Date(far.re_resDate).getHours() + 9))
                .toISOString()
                .split("T")[0]
            )
            .replace("#{예약시간}", far.re_time)}`;

          sendSMS(
            sendTime,
            message,
            cellphone,
            far.re_patientName,
            false,
            far.hospital.hsp_messageTrId,
            far.hospital.hsp_messageSendNum
          );
          console.log(`"${cellphone}", 문자 전송 완료.`);
        }

        if (far.resAlim.ra_type === "kakao") {
          const intFormatCellphone = toInternationalFormat(cellphone);

          const tokenInfo = await getAlimTalkToken();

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

          await sendAlimTalk(tokenInfo, intFormatCellphone, templateCode, message);

          console.log(`"${cellphone}", 예약 알림톡 전송 완료.`);
        }
      });

      return true;
    } catch (e) {
      console.log("예약 알림 스케쥴러 오류 =>", e);
      if (e.errorCode === 1) console.log("정확하지 않은 핸드폰번호는 카카오톡 발송이 불가능합니다.", e);
    }
  });
};

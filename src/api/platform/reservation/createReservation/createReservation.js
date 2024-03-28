import { PrismaClient } from "@prisma/client";
import sendSMS from "../../../../libs/sendSMS";
import sendEmail from "../../../../libs/sendEmail";
import webSocket from "../../../../libs/webSocket/webSocket";
import { getAlimTalkToken, sendAlimTalk } from "../../../../libs/infoKakaoAlim/alimtalk";
import { toInternationalFormat } from "../../../../libs/checkValidation";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        patientId,
        patientName,
        patientCellphone,
        oneLineMemo,
        resDate,
        time,
        status,
        largeCategory,
        smallCategory,
        doctorRoomName,
        dr_deptCode,
        alimType,
        alimTime1,
        alimTime2,
        alimTime3,
        alimTime4,
        alimTemplateId,
      } = args;
      try {
        console.log("args:", args);
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        const rsDate = new Date(resDate);
        const resDateConv = new Date(rsDate.getFullYear(), rsDate.getMonth(), rsDate.getDate());

        let patientInfo;
        if (patientId) patientInfo = await prisma.patient.findUnique({ where: { pati_id: patientId } });

        const patientNameConv = patientId ? patientInfo.pati_name : patientName.split("-")[0];

        const drRoom = await prisma.doctorRoom.findFirst({
          where: { AND: [{ hsp_id: hospital.hsp_id }, { dr_deptCode }] },
        });

        const reservation = await prisma.reservation.create({
          data: {
            re_creatorId: loginUser.user_id,
            re_creatorName: loginUser.user_name,
            re_creatorRank: loginUser.user_rank,
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_desireDate: resDateConv,
            re_desireTime: time,
            re_resDate: resDateConv,
            re_year: rsDate.getFullYear(),
            re_month: rsDate.getMonth() + 1,
            re_date: rsDate.getDate(),
            re_time: time,
            re_status: status,
            re_oneLineMem: oneLineMemo,
            re_patientName: patientNameConv,
            re_patientRrn: patientId ? patientInfo.pati_rrn : "",
            re_patientCellphone: patientId ? patientInfo.pati_cellphone : patientCellphone,
            re_LCategory: largeCategory,
            re_SCategory: smallCategory,
            re_doctorRoomName: doctorRoomName ? doctorRoomName : "",
            re_doctorRoomId: drRoom.dr_id,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
            patient: patientId ? { connect: { pati_id: patientInfo.pati_id } } : undefined,
          },
        });

        // 알림 생성
        await prisma.resAlim.create({
          data: {
            ra_type: alimType ? alimType : "sms",
            ra_time1: alimTime1 ? alimTime1 : true,
            ra_time2: alimTime2 ? alimTime2 : false,
            ra_time3: alimTime3 ? alimTime3 : false,
            ra_time4: alimTime4 ? alimTime4 : false,
            ra_templateId: alimTemplateId !== 0 ? alimTemplateId : 0,
            reservation: { connect: { re_id: reservation.re_id } },
          },
        });

        // 사용자 알림 있는지 확인
        const userAlimSet = await prisma.userPatientAlimSet.findFirst({
          where: { user_id: loginUser.user_id },
          orderBy: { upas_updatedAt: "desc" },
        });

        // 사용자 알림 세팅 저장 - 이미 있을경우 업데이트
        if (userAlimSet) {
          await prisma.userPatientAlimSet.update({
            where: { upas_id: userAlimSet.upas_id },
            data: {
              upas_type: alimType,
              upas_time1: alimTime1,
              upas_time2: alimTime2,
              upas_time3: alimTime3,
              upas_time4: alimTime4,
              upas_templateId: alimTemplateId !== 0 ? alimTemplateId : 0,
            },
          });
          // 없을 경우 생성
        } else {
          await prisma.userPatientAlimSet.create({
            data: {
              upas_type: alimType,
              upas_time1: alimTime1,
              upas_time2: alimTime2,
              upas_time3: alimTime3,
              upas_time4: alimTime4,
              upas_templateId: alimTemplateId !== 0 ? alimTemplateId : 0,
              user: { connect: { user_id: loginUser.user_id } },
            },
          });
        }

        const alimTemplate =
          alimTemplateId !== 0
            ? await prisma.resAlimTemplate.findUnique({
                where: { rat_id: alimTemplateId },
              })
            : {
                rat_text: `${patientNameConv}님 예약이 완료되었습니다.
                예약시간 ${rsDate.toISOString().split("T")[0]} ${time} 입니다. 방문 바랍니다.`,
              };

        const calTimeMs = 1000 * 60 * 60 * 9; // 한국시간 GMT+9 에 맞추기 위한 +9

        let offsetTime, sendTime;

        let message = `${alimTemplate.rat_text
          .replace("#{병원명}", hospital.hsp_name)
          .replace("#{환자명}", patientNameConv)
          .replace("#{예약일}", rsDate.toISOString().split("T")[0])
          .replace("#{시간}", `${time}`)
          .replace("#{진료의명}", "담당의")
          .replace("#{문의 전화번호}", hospital.hsp_phone)
          .replace("#{url}", hospital.hsp_email)}`;

        if (alimType === "sms") {
          if (!hospital.hsp_messageTrId) {
            console.log("smsSendFail : Cannot read properties of hospital.hsp_messageTrId");
            // throw 1;
          }
          if (!hospital.hsp_messageSendNum) {
            console.log("smsSendFail : Cannot read properties of hospital.hsp_messageSendNum");
            // throw 2;
          }

          if (alimTime1) {
            offsetTime = new Date().getTime() + calTimeMs;
            sendTime = new Date(offsetTime).toISOString();
            console.log("문자 발송. 시간 : ", sendTime);
            sendSMS(
              sendTime,
              message,
              patientCellphone,
              patientNameConv,
              false,
              hospital.hsp_messageTrId,
              hospital.hsp_messageSendNum
            );
          }
        } else {
          // 카카오 알림 발송
          if (alimTime1) {
            // 연동 기획 추가 필요
            const templateCode = "0139d6202c40c484a9e56936a9765b";

            // const intFormatCellphone = toInternationalFormat(patientCellphone);
            const intFormatCellphone = toInternationalFormat(patientCellphone.replaceAll("-", ""));
            const tokenInfo = await getAlimTalkToken();

            await sendAlimTalk(tokenInfo, intFormatCellphone, templateCode, message);
          }
        }

        // 알림 발송 할 병원, 삭제되지 않은 사용자, 알림을 켜둔 사용자
        const sendUsers = await prisma.user.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { NOT: { user_isDelete: true } }, { user_hnAlim: true }] },
        });

        const sendTitle = `[메디플랫폼] 예약 등록 안내`;
        const sendText = `안녕하세요. 메디플랫폼입니다.<br>
                새로운 예약이 아래와 같이 등록되었습니다. 확인바랍니다.<br>
                예약일 : ${rsDate.toISOString().split("T")[0]}<br>
                예약시간 : ${time}<br>
                환자명 : ${patientNameConv}<br>
                진료실명 : ${doctorRoomName}<br>
                <br>
                `;

        for (const sendUser of sendUsers) {
          await prisma.notiHistory.create({
            data: {
              ng_text: `"환자명 : ${patientNameConv}"님의 새로운 예약이 등록되었습니다.`,
              user: { connect: { user_id: sendUser.user_id } },
            },
          });
        }

        const sendEmails = sendUsers.map((su) => su.user_email);
        const joinEmails = sendEmails.join();

        await sendEmail(joinEmails, sendTitle, sendText);

        // Noti 알림 설정
        const alimInfo = {
          SendStatus: "alim",
          alimType: "reservation",
        };

        const resDateKst = new Date(rsDate.getFullYear(), rsDate.getMonth(), rsDate.getDate(), 9)
          .toISOString()
          .split("T")[0];

        const regReservationInfo = {
          SendStatus: "regReservation",
          resData: {
            desireDate: resDateKst,
            desireTime: time,
            resDate: resDateKst,
            resTime: time,
            status: status,
            patientName: patientNameConv,
            patientCellphone: patientId ? patientInfo.pati_cellphone : patientCellphone,
            doctorRoomName: doctorRoomName ? doctorRoomName : "",
            dr_deptCode: dr_deptCode ? dr_deptCode : "",
          },
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        await pub.publish(channelName, JSON.stringify(alimInfo));
        await pub.publish(channelName, JSON.stringify(regReservationInfo));

        // console.log({
        //   message: JSON.stringify(regReservationInfo),
        // });

        return true;
      } catch (e) {
        console.log("예약자 추가(등록) 실패. createReservation", e);
        if (e === 1) throw new Error("err_01"); // 문자 전송을 위한 거래처 번호 없음
        if (e === 2) throw new Error("err_02"); // 문자 전송을 위한 발신자 번호 없음
        throw new Error("err_00");
      }
    },
  },
};

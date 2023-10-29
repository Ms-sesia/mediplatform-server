import { PrismaClient } from "@prisma/client";
import sendSMS from "../../../../libs/sendSMS";
import { today9 } from "../../../../libs/todayCal";

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
        alimType,
        alimTime1,
        alimTime2,
        alimTime3,
        alimTime4,
        alimTemplateId,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        const rsDate = new Date(resDate);

        let patientInfo;
        if (patientId) patientInfo = await prisma.patient.findUnique({ where: { pati_id: patientId } });

        const reservation = await prisma.reservation.create({
          data: {
            re_creatorId: loginUser.user_id,
            re_creatorName: loginUser.user_name,
            re_creatorRank: loginUser.user_rank,
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_desireDate: rsDate,
            re_desireTime: time,
            re_resDate: rsDate,
            re_year: rsDate.getFullYear(),
            re_month: rsDate.getMonth() + 1,
            re_date: rsDate.getDate(),
            re_time: time,
            re_status: status,
            re_oneLineMem: oneLineMemo,
            re_patientName: patientId ? patientInfo.pati_name : patientName,
            re_patientRrn: patientId ? patientInfo.pati_rrn : "",
            re_patientCellphone: patientId ? patientInfo.pati_cellphone : patientCellphone,
            re_LCategory: largeCategory,
            re_SCategory: smallCategory,
            re_doctorRoomName: doctorRoomName,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
            patient: patientId ? { connect: { pati_id: patientInfo.pati_id } } : undefined,
          },
        });

        if (alimTemplateId !== 0) {
          await prisma.resAlim.create({
            data: {
              ra_type: alimType,
              ra_time1: alimTime1,
              ra_time2: alimTime2,
              ra_time3: alimTime3,
              ra_time4: alimTime4,
              ra_templateId: alimTemplateId,
              reservation: { connect: { re_id: reservation.re_id } },
            },
          });
        }

        const alimTemplate =
          alimTemplateId !== 0
            ? await prisma.resAlimTemplate.findUnique({
                where: { rat_id: alimTemplateId },
              })
            : {
                rat_text: `${patientName}님 예약이 완료되었습니다. 
                예약시간 ${rsDate.toISOString().split("T")[0]} ${time} 입니다. 방문 바랍니다.`,
              };

        const calTimeMs = 1000 * 60 * 60 * 9; // 한국시간 GMT+9 에 맞추기 위한 +9

        let offsetTime, sendTime;

        let message = `${alimTemplate.rat_text
          .replace("{병원명}", hospital.hsp_name)
          .replace("{환자명}", patientName)
          .replace("{예약일}", rsDate.toISOString().split("T")[0])
          .replace("{예약시간}", time)}`;

        if (alimType === "sms") {
          if (alimTime1) {
            offsetTime = new Date().getTime() + calTimeMs;
            sendTime = new Date(offsetTime).toISOString();
            // console.log("발송시간:", sendTime);
            // console.log("발송 메세지:", message);
            sendSMS(sendTime, message, patientCellphone, patientName, false);
          }
          // 1일 전 오전 9시
          if (alimTime2) {
            offsetTime =
              new Date(rsDate.getFullYear(), rsDate.getMonth(), rsDate.getDate() - 1, 9).getTime() + calTimeMs;
            sendTime = new Date(offsetTime).toISOString();
            console.log("1일 전:", sendTime);
            sendSMS(sendTime, message, patientCellphone, patientName, true);
          }
          // 2일 전 오전 9시
          if (alimTime3) {
            offsetTime =
              new Date(rsDate.getFullYear(), rsDate.getMonth(), rsDate.getDate() - 2, 9).getTime() + calTimeMs;
            sendTime = new Date(offsetTime).toISOString();
            console.log("2일 전:", sendTime);
            sendSMS(sendTime, message, patientCellphone, patientName, true);
          }
          // 당일 오전 9시
          if (alimTime4) {
            offsetTime = new Date(rsDate.getFullYear(), rsDate.getMonth(), rsDate.getDate(), 9).getTime() + calTimeMs;
            sendTime = new Date(offsetTime).toISOString();
            console.log("당일 오전:", sendTime);
            sendSMS(sendTime, message, patientCellphone, patientName, true);
          }
        }

        return true;
      } catch (e) {
        console.log("예약자 추가(등록) 실패. createReservation", e);
        throw new Error("err_00");
      }
    },
  },
};

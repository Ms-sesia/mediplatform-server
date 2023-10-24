import { PrismaClient } from "@prisma/client";
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

        return true;
      } catch (e) {
        console.log("예약자 추가(등록) 실패. createReservation", e);
        throw new Error("예약자 추가(등록)에 실패하였습니다.");
      }
    },
  },
};

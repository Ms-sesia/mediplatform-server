import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        re_id,
        resDate,
        time,
        status,
        largeCategory,
        smallCategory,
        doctorRoomName,
        dr_deptCode,
        oneLineMemo,
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

        const drRoom = await prisma.doctorRoom.findFirst({
          where: { AND: [{ hsp_id: loginUser.hsp_id }, { dr_deptCode }] },
        });

        const reservation = await prisma.reservation.update({
          where: { re_id },
          data: {
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_year: rsDate.getFullYear(),
            re_month: rsDate.getMonth() + 1,
            re_date: rsDate.getDate(),
            re_time: time,
            re_status: status,
            re_LCategory: largeCategory,
            re_SCategory: smallCategory,
            re_doctorRoomName: doctorRoomName,
            re_doctorRoomId: drRoom.dr_id,
            re_oneLineMem: oneLineMemo,
            resAlim: {
              update: {
                data: {
                  ra_type: alimType,
                  ra_time1: alimTime1,
                  ra_time2: alimTime2,
                  ra_time3: alimTime3,
                  ra_time4: alimTime4,
                  ra_templateId: alimTemplateId,
                },
              },
            },
          },
        });

        return true;
      } catch (e) {
        console.log("예약자 정보 수정 실패. updateReservation", e);
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";
import ibResUpdate from "../../../../libs/infobankRes/IBResUpdate";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { re_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({
          where: { hsp_id: user.hospital.hsp_id },
        });

        const reservation = await prisma.reservation.update({
          where: { re_id },
          data: {
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_status: "cancel",
            re_isDelete: true,
            re_deleteDate: new Date(),
          },
        });

        if (reservation.re_platform !== "kakao") {
          await prisma.resAlim.update({
            where: { re_id },
            data: {
              ra_type: alimType,
              ra_time1: false,
              ra_time2: false,
              ra_time3: false,
              ra_time4: false,
              ra_templateId: 0,
            },
          });
        }

        if (reservation.re_platform === "kakao") {
          const ibResUpdateResult = await ibResUpdate(re_id, reservation, hospital);

          if (!ibResUpdateResult) throw "err_01";
        }

        return true;
      } catch (e) {
        console.log("예약 정보 삭제 실패. deleteReservation", e);
        throw new Error("err_00");
      }
    },
  },
};

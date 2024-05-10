import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";
import ibResUpdate from "../../../../libs/infobankRes/IBResUpdate";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateReservationStatus: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { re_id, status } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const res = await prisma.reservation.findUnique({ where: { re_id } });

        const hospital = await prisma.hospital.findUnique({
          where: { hsp_id: user.hospital.hsp_id },
        });

        const reservation = await prisma.reservation.update({
          where: { re_id },
          data: {
            re_status: status,
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_confirmUserName: status === "confirm" ? loginUser.user_name : "",
            re_confirmUserRank: status === "confirm" ? loginUser.user_name : loginUser.user_rank,
            re_confirmDate: status === "confirm" ? today9 : res.re_confirmDate,
          },
        });

        if (reservation.re_platform === "kakao") {
          const ibResUpdateResult = await ibResUpdate(re_id, reservation, hospital);

          if (!ibResUpdateResult) throw "err_01";
        }
        return true;
      } catch (e) {
        console.log("예약 상태 변경 실패. updateReservationStatus", e);
        throw new Error("err_00");
      }
    },
  },
};

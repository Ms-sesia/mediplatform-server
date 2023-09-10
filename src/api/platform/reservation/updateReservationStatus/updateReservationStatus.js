import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

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

        await prisma.reservation.update({
          where: { re_id },
          data: {
            re_status: status,
            re_updatedAt: today9,
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_confirmUserName: status === "confirm" ? loginUser.user_name : "",
            re_confirmUserRank: status === "confirm" ? loginUser.user_name : loginUser.user_rank,
            re_confirmDate: status === "confirm" ? today9 : res.re_confirmDate,
          },
        });

        return true;
      } catch (e) {
        console.log("예약 상태 변경 실패. updateReservationStatus", e);
        throw new Error("err_00");
      }
    },
  },
};

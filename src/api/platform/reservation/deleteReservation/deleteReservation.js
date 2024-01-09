import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { re_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.reservation.update({
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

        return true;
      } catch (e) {
        console.log("예약 정보 삭제 실패. deleteReservation", e);
        throw new Error("err_00");
      }
    },
  },
};

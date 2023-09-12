import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteSpecialSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ss_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.specialSchedule.update({
          where: { ss_id },
          data: {
            ss_updatedAt: today9,
            ss_editorId: loginUser.user_id,
            ss_editorName: loginUser.user_name,
            ss_editorRank: loginUser.user_rank,
            ss_isDelete: true,
            ss_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("특별일정 삭제 실패. deleteSpecialSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};

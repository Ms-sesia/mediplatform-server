import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateMyEmployeeInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_org, user_job } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            user_updatedAt: today9,
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_org,
            user_job,
          },
        });

        return true;
      } catch (e) {
        console.log("내 인사정보 수정 실패. updateMyEmployeeInfo", e);
        throw new Error("err_00");
      }
    },
  },
};

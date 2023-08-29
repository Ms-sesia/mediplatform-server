import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.user.update({
          where: { user_id },
          data: {
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_isDelete: true,
            user_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 삭제 실패. deleteUser", e);
        throw new Error("사용자 삭제에 실패하였습니다.");
      }
    },
  },
};

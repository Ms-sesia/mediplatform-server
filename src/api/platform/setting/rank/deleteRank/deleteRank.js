import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { rank_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.rank.update({
          where: { rank_id },
          data: {
            rank_editorId: loginUser.user_id,
            rank_editorName: loginUser.user_name,
            rank_editorRank: loginUser.user_rank,
            rank_isDelete: true,
            rank_deleteDate: today9,
          },
        });

        return true;
      } catch (e) {
        console.log("진료실 삭제 실패. deleteRank", e);
        throw new Error("진료실 삭제에 실패하였습니다.");
      }
    },
  },
};

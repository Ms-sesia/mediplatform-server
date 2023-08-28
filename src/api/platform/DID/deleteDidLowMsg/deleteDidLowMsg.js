import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDidLowMsg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dlm_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const today = new Date();

        await prisma.didLowMsg.update({
          where: { dlm_id },
          data: {
            dlm_editorName: loginUser.user_name,
            dlm_editorRank: loginUser.user_rank,
            dlm_editorId: loginUser.user_id,
            dlm_isDelete: true,
            dlm_deleteDate: today,
          },
        });

        return true;
      } catch (e) {
        console.log("did 하단 메세지 삭제 실패. deleteDidLowMsg", e);
        throw new Error("did 하단 메세지 삭제에 실패하였습니다.");
      }
    },
  },
};

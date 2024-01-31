import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateOneOnOneComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneAn_id, oneAn_text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const oneComment = await prisma.oneOnOneAnswer.findUnique({ where: { oneAn_id } });

        if (oneComment.oneAn_creatorId !== loginUser.user_id) throw 1;

        await prisma.oneOnOneAnswer.update({
          where: { oneAn_id },
          data: {
            oneAn_createdAt: new Date(),
            oneAn_answer: oneAn_text,
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 댓글 수정 실패. updateOneOnOneComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

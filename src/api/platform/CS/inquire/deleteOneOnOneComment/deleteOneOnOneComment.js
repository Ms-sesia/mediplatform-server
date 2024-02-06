import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteOneOnOneComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneAn_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const oneComment = await prisma.oneOnOneAnswer.findUnique({ where: { oneAn_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (oneComment.oneAn_creatorId !== loginUser.user_id && hospital.hsp_email !== loginUser.user_email) throw 1;

        await prisma.oneOnOneAnswer.update({
          where: { oneAn_id },
          data: {
            oneAn_isDelete: true,
            oneAn_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 댓글 삭제 실패. deleteOneOnOneComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createOneOnOneComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.oneOnOneAnswer.create({
          data: {
            oneAn_adminAble: false,
            oneAn_creatorName: loginUser.user_name,
            oneAn_creatorRank: loginUser.user_rank,
            oneAn_creatorId: loginUser.user_id,
            oneAn_answer: text,
            oneOnOne: { connect: { oneq_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 댓글 등록 실패. createOneOnOneComment", e);
        throw new Error("err_00");
      }
    },
  },
};

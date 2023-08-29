import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { rank_name } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.rank.create({
          data: {
            rank_creatorId: loginUser.user_id,
            rank_creatorName: loginUser.user_name,
            rank_creatorRank: loginUser.user_rank,
            rank_name,
            hospital: { connect: { hsp_id: loginUser.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("직책 등록 실패. createRank", e);
        throw new Error("직책 등록에 실패하였습니다.");
      }
    },
  },
};

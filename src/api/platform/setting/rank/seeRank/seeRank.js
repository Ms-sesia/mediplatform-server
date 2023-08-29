import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const rankList = await prisma.rank.findMany({
          where: { rank_isDelete: false },
          orderBy: { rank_name: "asc" },
        });

        if (!rankList.length)
          return {
            totalLength: 0,
            rankList: [],
          };

        return {
          totalLength: rankList.length ? rankList.length : 0,
          rankList: rankList.length ? rankList : [],
        };
      } catch (e) {
        console.log("직책 조회 실패. seeRank ==>\n", e);
        throw new Error("직책 조회에 실패하였습니다.");
      }
    },
  },
};

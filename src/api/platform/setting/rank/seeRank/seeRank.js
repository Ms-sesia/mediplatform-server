import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const rankList = await prisma.rank.findMany({
          where: {
            AND: [{ rank_isDelete: false }, { hsp_id: user.hospita.hsp_id }, { NOT: { rank_name: "대표원장" } }],
          },
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

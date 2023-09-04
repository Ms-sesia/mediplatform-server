import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeSearchHistory: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const searchHistory = await prisma.searchHistory.findMany({
          where: { user_id: user.user_id },
          take: 10,
          orderBy: { sh_createdAt: "desc" },
        });

        return searchHistory.length ? searchHistory : [];
      } catch (e) {
        console.log("검색어 조회 실패. seeSearchHistory ==>\n", e);
        throw new Error("검색어 조회에 실패하였습니다.");
      }
    },
  },
};

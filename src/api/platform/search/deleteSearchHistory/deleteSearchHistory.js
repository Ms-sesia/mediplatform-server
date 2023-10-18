import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteSearchHistory: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { sh_id } = args;
      try {
        await prisma.searchHistory.delete({ where: { sh_id } });

        return true;
      } catch (e) {
        console.log("검색어 삭제 실패. deleteSearchHistory ==>\n", e);
        throw new Error("검색어 삭제에 실패하였습니다.");
      }
    },
  },
};

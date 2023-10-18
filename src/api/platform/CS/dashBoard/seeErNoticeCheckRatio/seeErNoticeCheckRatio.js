import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeErNoticeCheckRatio: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const platformNotice = await prisma.platformNotice.count({
          where: { pn_isDelete: { not: true } },
        });

        const pnCheck = await prisma.platformNoticeCheck.count();

        const ratio = Math.floor((pnCheck / platformNotice) * 100);

        return ratio;
      } catch (e) {
        console.log("공지 확인율 조회 실패. seeErNoticeCheckRatio ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

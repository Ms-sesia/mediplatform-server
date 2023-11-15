import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeServiceContentDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hsc = await prisma.homepageServiceContent.findMany({
          orderBy: { hsc_createdAt: "desc" },
        });

        const hscList = hsc.map(async (hscTitle) => {
          const hscd = await prisma.homepageServiceContentDetail.findMany({
            where: { hsc_id: hscTitle.hsc_id },
          });

          return {
            hsc_id: hscTitle.hsc_id,
            title: hscTitle.hsc_title,
            detailTextCount: hscd.length,
            createdAt: new Date(hscTitle.hsc_createdAt).toISOString(),
            creatorName: hscTitle.hsc_adminName,
            creatorRank: hscTitle.hsc_adminRank,
          };
        });

        return hsc.length ? hscList : [];
      } catch (e) {
        console.log("홈페이지 서비스 내용 상세 조회 실패. seeServiceContentDetail", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

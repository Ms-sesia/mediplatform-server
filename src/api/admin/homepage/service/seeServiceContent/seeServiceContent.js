import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeServiceContent: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { serviceType, detailTabName } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hsc = await prisma.homepageServiceContent.findMany({
          where: { AND: [{ hsc_serviceType: serviceType }, { hsc_detailTabName: detailTabName }] },
          orderBy: { hsc_createdAt: "desc" },
        });

        const hscList = hsc.map(async (hscTitle) => {
          const hscd = await prisma.homepageServiceContentDetail.findMany({
            where: { hsc_id: hscTitle.hsc_id },
          });

          const detailTexts = hscd.map((detail) => {
            return detail.hsd_text;
          });

          return {
            hsc_id: hscTitle.hsc_id,
            title: hscTitle.hsc_title,
            detailTextCount: hscd.length,
            createdAt: new Date(hscTitle.hsc_createdAt).toISOString(),
            creatorName: hscTitle.hsc_adminName,
            creatorRank: hscTitle.hsc_adminRank,
            serviceDetail: detailTexts,
          };
        });

        return hsc.length ? hscList : [];
      } catch (e) {
        console.log("홈페이지 서비스 내용 조회(emr 차트 / cloud 플랫폼) 실패. seeServiceContent", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

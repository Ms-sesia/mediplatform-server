import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHPServiceDetail: async (_, args, { request, isAuthenticated }) => {
      try {
        const hsd = await prisma.homepageServiceDetail.findFirst();

        if (!hsd.hsd_url)
          return {
            hsd_id: 0,
            hsd_createdAt: "",
            hsd_url: "",
            hsd_adminName: "",
            hsd_adminRank: "",
            hsd_adminId: 0,
          };

        return {
          hsd_id: hsd.hsd_id,
          hsd_createdAt: new Date(hsd.hsd_createdAt).toISOString(),
          hsd_url: hsd.hsd_url ? hsd.hsd_url : "",
          hsd_adminName: hsd.hsd_adminName ? hsd.hsd_adminName : "",
          hsd_adminRank: hsd.hsd_adminRank ? hsd.hsd_adminRank : "",
          hsd_adminId: hsd.hsd_adminId ? hsd.hsd_adminId : 0,
        };
      } catch (e) {
        console.log("홈페이지 서비스 상세 이미지 조회에 실패. seeHPServiceDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

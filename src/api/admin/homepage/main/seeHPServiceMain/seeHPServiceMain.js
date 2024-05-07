import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHPServiceMain: async (_, args, { request, isAuthenticated }) => {
      try {
        const hsm = await prisma.homepageServiceMain.findFirst();

        if (!hsm.hsm_url)
          return {
            hsm_id: 0,
            hsm_createdAt: "",
            hsm_url: "",
            hsm_adminName: "",
            hsm_adminRank: "",
            hsm_adminId: 0,
          };

        return {
          hsm_id: hsm.hsm_id,
          hsm_createdAt: new Date(hsm.hsm_createdAt).toISOString(),
          hsm_url: hsm.hsm_url ? hsm.hsm_url : "",
          hsm_adminName: hsm.hsm_adminName ? hsm.hsm_adminName : "",
          hsm_adminRank: hsm.hsm_adminRank ? hsm.hsm_adminRank : "",
          hsm_adminId: hsm.hsm_adminId ? hsm.hsm_adminId : 0,
        };
      } catch (e) {
        console.log("홈페이지 서비스 메인 이미지 조회 실패. seeHPServiceMain ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

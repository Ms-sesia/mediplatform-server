import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHPCs: async (_, args, { request, isAuthenticated }) => {
      try {
        const hcs = await prisma.homepageCS.findFirst();

        if (!hcs.hcs_url)
          return {
            hcs_id: 0,
            hcs_createdAt: "",
            hcs_url: "",
            hcs_adminName: "",
            hcs_adminRank: "",
            hcs_adminId: 0,
          };

        return {
          hcs_id: hcs.hcs_id,
          hcs_createdAt: new Date(hcs.hcs_createdAt).toISOString(),
          hcs_url: hcs.hcs_url ? hcs.hcs_url : "",
          hcs_adminName: hcs.hcs_adminName ? hcs.hcs_adminName : "",
          hcs_adminRank: hcs.hcs_adminRank ? hcs.hcs_adminRank : "",
          hcs_adminId: hcs.hcs_adminId ? hcs.hcs_adminId : 0,
        };
      } catch (e) {
        console.log("홈페이지 고객지원 이미지 조회 실패. seeHPCs ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

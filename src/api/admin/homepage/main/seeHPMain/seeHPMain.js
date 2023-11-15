import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHPMain: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      try {
        // if (user.userType !== "admin") throw 1;
        // const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hm = await prisma.homepageMain.findFirst();

        if (!hm)
          return {
            hm_id: 0,
            hm_createdAt: "",
            hm_url: "",
            hm_adminName: "",
            hm_adminRank: "",
            hm_adminId: 0,
          };

        return {
          hm_id: hm.hm_id,
          hm_createdAt: new Date(hm.hm_createdAt).toISOString(),
          hm_url: hm.hm_url ? hm.hm_url : "",
          hm_adminName: hm.hm_adminName ? hm.hm_adminName : "",
          hm_adminRank: hm.hm_adminRank ? hm.hm_adminRank : "",
          hm_adminId: hm.hm_adminId ? hm.hm_adminId : 0,
        };
      } catch (e) {
        console.log("홈페이지 메인 이미지 조회 실패. seeHPMain ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

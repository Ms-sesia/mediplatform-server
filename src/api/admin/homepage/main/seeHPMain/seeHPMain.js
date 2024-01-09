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

        const hm = await prisma.homepageMain.findMany({
          orderBy: { hm_id: "asc" },
        });

        if (!hm.length) return [];

        const hmList = hm.map((hmInfo) => {
          hmInfo.hm_createdAt = new Date(hmInfo.hm_createdAt).toISOString();
          return hmInfo;
        });

        return hm.length ? hmList : [];
      } catch (e) {
        console.log("홈페이지 메인 이미지 조회 실패. seeHPMain ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

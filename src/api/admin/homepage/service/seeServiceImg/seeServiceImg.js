import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeServiceImg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsi_serviceType, hsi_detailTabName } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hscImg = await prisma.homepageServiceImg.findMany({
          where: { AND: [{ hsi_serviceType }, { hsi_detailTabName }] },
        });

        const serviceImgs = hscImg.map((hsci) => {
          hsci.hsi_createdAt = new Date(hsci.hsi_createdAt).toISOString();

          return hsci;
        });

        return hscImg.length ? serviceImgs : [];
      } catch (e) {
        console.log("홈페이지 서비스 이미지 조회 실패. seeServiceImg ==> \n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

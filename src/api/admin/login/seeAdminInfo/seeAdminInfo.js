import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeAdminInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { orderBy, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const admin = await prisma.admin.findUnique({
          where: { admin_id: user.admin_id },
          include: {
            admin_permission: {
              select: {
                ap_id: true,
                ap_dash: true,
                ap_homepage: true,
                ap_CS: true,
                ap_system: true,
              },
            },
          },
        });

        const lastLogin = await prisma.adminLoginHistory.findFirst({
          where: { admin_id: admin.admin_id },
          orderBy: { alh_createdAt: "desc" },
        });

        admin.admin_createdAt = new Date(admin.admin_createdAt).toISOString();
        admin.admin_lastLogin = new Date(lastLogin.alh_createdAt).toISOString();

        return admin;
      } catch (e) {
        console.log("로그인 관리자 정보 조회에 실패하였습니다. seeAdminInfo ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

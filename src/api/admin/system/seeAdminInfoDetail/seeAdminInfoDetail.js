import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeAdminInfoDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_id } = args;
      try {
        if (!user.admin_master) throw 1;

        const admin = await prisma.admin.findUnique({
          where: { admin_id },
          include: {
            admin_permission: {
              select: {
                ap_id: true,
                ap_dash: true,
                ap_homepage: true,
                ap_CS: true,
                ap_system: true,
                ap_faq: true,
                ap_notice: true,
              },
            },
          },
        });

        return admin;
      } catch (e) {
        console.log("관리자 계정 상세 조회 실패. seeAdminInfoDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

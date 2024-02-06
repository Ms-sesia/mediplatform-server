import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeAdminList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { orderBy, take, cursor } = args;
      try {
        if (!user.admin_master) throw 1;

        const totalAdmin = await prisma.admin.findMany({
          where: { NOT: { admin_master: true } },
          orderBy: { admin_email: orderBy === "desc" ? "desc" : "asc" },
        });

        if (!totalAdmin.length)
          return {
            totalLength: 0,
            adminList: [],
          };

        const cursorId = totalAdmin[cursor].admin_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { admin_id: cursorId } };

        const admins = await prisma.admin.findMany({
          where: { NOT: { admin_master: true } },
          ...cursorOpt,
          orderBy: { admin_email: orderBy === "desc" ? "desc" : "asc" },
          include: {
            admin_permission: {
              select: {
                ap_id: true,
                ap_dash: true,
                ap_homepage: true,
                ap_CS: true,
                ap_system: true,
                ap_notice: true,
                ap_faq: true,
              },
            },
          },
        });

        const adminList = admins.map(async (admin) => {
          admin.admin_createdAt = new Date(admin.admin_createdAt).toISOString();
          return admin;
        });

        return {
          totalLength: totalAdmin.length ? totalAdmin.length : 0,
          adminList: adminList.length ? adminList : [],
        };
      } catch (e) {
        console.log("관리자 계정 목록 조회 실패. seeAdminList ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

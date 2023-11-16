import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateAdminPermission: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_id, ap_dash, ap_homepage, ap_CS, ap_system } = args;
      try {
        if (!user.admin_master) throw 1;

        await prisma.adminPermission.update({
          where: { admin_id },
          data: {
            ap_dash,
            ap_homepage,
            ap_CS,
            ap_system,
          },
        });

        return true;
      } catch (e) {
        console.log("관리자 권한 수정 실패. updateAdminPermission", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

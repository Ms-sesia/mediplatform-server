import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_id } = args;
      try {
        if (!user.admin_master) throw 1;

        // 로그인 기록 삭제
        await prisma.adminLoginHistory.deleteMany({
          where: { admin_id },
        });

        // 권한 삭제
        await prisma.adminPermission.deleteMany({
          where: { admin_id },
        });

        // 관리자 삭제F
        await prisma.admin.delete({
          where: { admin_id },
        });

        return true;
      } catch (e) {
        console.log("관리자 삭제 실패. deleteAdmin", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

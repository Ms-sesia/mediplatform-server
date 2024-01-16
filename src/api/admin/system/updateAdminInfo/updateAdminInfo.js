import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateAdminInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_id, admin_name, admin_rank, admin_cellphone } = args;
      try {
        if (!user.admin_master) throw 0;

        const admin = await prisma.admin.update({
          where: { admin_id },
          data: {
            admin_name,
            admin_rank,
            admin_cellphone,
          },
        });

        return true;
      } catch (e) {
        console.log("관리자 계정 정보 수정 실패. updateAdminInfo", e);
        if (e === 0) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        if (user_id === loginUser.user_id) throw 1;

        await prisma.user.update({
          where: { user_id },
          data: {
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_isDelete: true,
            user_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 삭제 실패. deleteUser", e);
        if (e === 1) throw new Error("err_01"); // 로그인한 계정은 삭제할 수 없습니다.
        throw new Error("err_00");
      }
    },
  },
};

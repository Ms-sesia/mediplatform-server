import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    checkUserEmail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { email } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const finduser = await prisma.user.findMany({
          where: { user_email: { contains: email } },
        });

        if (finduser.length) return true;
        else return false;
      } catch (e) {
        console.log("사용자 계정(이메일) 가입여부 확인 실패. checkUserEmail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

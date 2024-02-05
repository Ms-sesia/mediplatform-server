import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    checkEmail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { email } = args;
      try {
        if (!user.admin_master) throw 1;

        const finduser = await prisma.user.findMany({
          where: { user_email: { contains: email } },
        });

        if (finduser.length) return true;
        else return false;
      } catch (e) {
        console.log("사용자 계정(이메일) 가입여부 확인 실패. checkEmail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

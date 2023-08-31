import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeUserInfoDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const checkUser = await prisma.user.findMany({
          where: { AND: [{ user_id: user.user_id }, { user_isDelete: false }] },
        });
        if (!checkUser.length) throw 1;

        const loginUser = await prisma.user.findUnique({
          where: { user_id: user.user_id },
        });

        return loginUser;
      } catch (e) {
        console.log("사용자 기본 정보 조회 실패. seeUserInfoDetail ==>\n", e);
        if (e === 1) throw new Error("존재하지 않거나 삭제된 사용자입니다.");
        throw new Error("사용자 기본 정보 조회에 실패하였습니다.");
      }
    },
  },
};

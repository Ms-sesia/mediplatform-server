import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    checkNoti: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      // const { ng_id } = args;
      try {
        // await prisma.notiHistory.updateMany({
        //   where: { user: { user_id: user.user_id } },
        //   data: { ng_check: true },
        // });
        await prisma.notiHistory.deleteMany({
          where: { user: { user_id: user.user_id } },
          // data: { ng_check: true },
        });

        return true;
      } catch (e) {
        console.log("알림 확인에 실패. checkMyNoti ==>\n", e);
        throw new Error("알림 확인에 실패하였습니다.");
      }
    },
  },
};

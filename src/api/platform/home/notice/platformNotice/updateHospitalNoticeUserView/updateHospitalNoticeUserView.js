import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospitalNoticeUserView: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id } = args;
      try {
        // const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const platformNoticeCheck = await prisma.platformNoticeCheck.findMany({
          where: { AND: [{ pn_id }, { user_id: user.user_id }] },
        });

        if (platformNoticeCheck.length) return true;

        await prisma.platformNoticeCheck.create({
          data: {
            platformNotice: { connect: { pn_id } },
            user: { connect: { user_id: user.user_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 수정 실패. updateHospitalNoticeUserView", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

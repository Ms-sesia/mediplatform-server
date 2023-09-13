import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createAdminOneOnOneAnswer: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id, answer } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        await prisma.oneOnOneAnswer.create({
          data: {
            oneAn_createdAt: today9,
            oneAn_adminCreatorName: loginAdmin.admin_name,
            oneAn_adminCreatorRank: loginAdmin.admin_rank,
            oneAn_adminCreatorId: loginAdmin.admin_id,
            oneAn_adminAble: true,
            oneAn_answer: answer,
            oneOnOne: { connect: { oneq_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("일대일 문의 답변 실패. createAdminOneOnOneAnswer", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

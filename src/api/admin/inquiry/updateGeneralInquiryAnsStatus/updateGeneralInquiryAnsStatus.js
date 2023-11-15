import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateGeneralInquiryAnsStatus: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { gi_id } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        await prisma.generalInquiry.update({
          where: { gi_id },
          data: { gi_answerStatus: true },
        });

        return true;
      } catch (e) {
        console.log("문의하기 답변 상태 변경F 실패. updateGeneralInquiryAnsStatus", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

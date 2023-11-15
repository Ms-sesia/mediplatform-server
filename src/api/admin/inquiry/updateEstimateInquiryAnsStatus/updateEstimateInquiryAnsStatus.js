import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateEstimateInquiryAnsStatus: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ei_id } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        await prisma.estimateInquiry.update({
          where: { ei_id },
          data: { ei_answerStatus: true },
        });

        return true;
      } catch (e) {
        console.log("견적 문의하기 답변 상태 변경 실패. updateEstimateInquiryAnsStatus", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

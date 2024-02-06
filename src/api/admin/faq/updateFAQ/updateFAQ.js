import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateFAQ: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { faq_id, question, answer } = args;
      try {
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        if (!loginAdmin) throw 1;

        await prisma.faq.update({
          where: { faq_id },
          data: {
            faq_adminEditorId: loginAdmin.admin_id,
            faq_adminEditorName: loginAdmin.admin_name,
            faq_adminEditorRank: loginAdmin.admin_rank,
            faq_question: question,
            faq_answer: answer,
          },
        });

        return true;
      } catch (e) {
        console.log("자주묻는질문 등록 실패. updateFAQ", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

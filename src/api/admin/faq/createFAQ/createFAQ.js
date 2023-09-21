import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createFAQ: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { question, answer } = args;
      try {
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        if (!loginAdmin) throw 1;

        await prisma.faq.create({
          data: {
            faq_createdAt: today9,
            faq_updatedAt: today9,
            faq_creatorId: loginAdmin.admin_id,
            faq_creatorName: loginAdmin.admin_name,
            faq_question: question,
            faq_answer: answer,
          },
        });

        return true;
      } catch (e) {
        console.log("자주묻는질문 등록 실패. createFAQ", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

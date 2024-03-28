import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHighViewQuestion: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const descFaq = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          take: 3,
          orderBy: [{ faq_viewCount: "desc" }, { faq_createdAt: "desc" }],
        });

        const faqList = descFaq.map((fq) => {
          return {
            faq_id: fq.faq_id,
            faq_question: fq.faq_question,
            faq_answer: fq.faq_answer,
          };
        });

        return descFaq.length ? faqList : [];
      } catch (e) {
        console.log("조회수가 높은 질문 조회 실패. seeHighViewQuestion ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

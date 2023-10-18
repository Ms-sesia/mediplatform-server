import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeRecentlyQuestion: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const descFaq = await prisma.faq.findMany({
          take: 3,
          orderBy: { faq_createdAt: "desc" },
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
        console.log("최근 등록 질문 조회 실패. seeRecentlyQuestion ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

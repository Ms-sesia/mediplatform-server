import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHighCommentQuestion: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const descFaq = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          take: 3,
          include: { _count: { select: { faqLike: true } } },
          orderBy: [{ faqLike: { _count: "desc" } }, { faq_createdAt: "desc" }],
        });

        return descFaq.length ? descFaq : [];
      } catch (e) {
        console.log("리뷰(댓글)이 많은 질문 조회 실패. seeHighCommentQuestion ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

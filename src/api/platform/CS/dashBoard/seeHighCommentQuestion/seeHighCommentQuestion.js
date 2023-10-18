import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHighCommentQuestion: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const faqLikeCount = await prisma.faqLike.groupBy({
          by: ["faq_id"],
          _count: true,
        });

        // faq_id와 카운트 매핑을 생성합니다.
        const faqIdToCount = {};
        for (const entry of faqLikeCount) {
          faqIdToCount[entry.faq_id] = entry._count;
        }

        // 2. faq 모델을 조회합니다.
        const faqs = await prisma.faq.findMany({
          include: { faqLike: true },
        });

        // faqLike의 카운트를 기준으로 정렬합니다.
        faqs.sort((a, b) => (faqIdToCount[b.faq_id] || 0) - (faqIdToCount[a.faq_id] || 0));

        // return [];
        return faqs.length ? faqs.slice(0, 3) : [];
      } catch (e) {
        console.log("리뷰(댓글)이 많은 질문 조회 실패. seeHighCommentQuestion ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

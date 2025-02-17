import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeFAQ: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const totalFaqList = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          orderBy: { faq_createdAt: "desc" },
        });

        if (!totalFaqList.length)
          return {
            totalLength: 0,
            faqList: [],
          };

        // const cursorId = totalFaqList[cursor].faq_id;
        // const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { faq_id: cursorId } };

        const faqList = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          // take: 4,
          orderBy: { faq_createdAt: "desc" },
        });

        const faqListTimeConv = faqList.map(async (faq) => {
          faq.faq_createdAt = new Date(faq.faq_createdAt).toISOString();
          faq.faq_updatedAt = new Date(faq.faq_updatedAt).toISOString();

          const faqLikeCount = await prisma.faqLike.count({
            where: { AND: [{ faq_id: faq.faq_id }, { fl_like: true }] },
          });

          const myLikeStatus = await prisma.faqLike.findFirst({
            where: { AND: [{ user_id: user.user_id }, { faq_id: faq.faq_id }] },
          });
          faq.faq_likeCount = faqLikeCount;
          faq.faq_myLikeStatus = myLikeStatus ? myLikeStatus.fl_like : false;

          return faq;
        });

        return {
          totalLength: totalFaqList.length ? totalFaqList.length : 0,
          faqList: faqList.length ? faqListTimeConv : [],
        };
      } catch (e) {
        console.log("자주묻는질문 목록 조회 실패. seeFAQ ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

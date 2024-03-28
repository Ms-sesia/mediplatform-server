import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeFAQDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { faq_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const faq = await prisma.faq.findUnique({ where: { faq_id } });

        faq.faq_createdAt = new Date(faq.faq_createdAt).toISOString();
        faq.faq_updatedAt = new Date(faq.faq_updatedAt).toISOString();

        const faqLikeCount = await prisma.faqLike.count({
          where: { AND: [{ faq_id: faq.faq_id }, { fl_like: true }] },
        });

        const myLikeStatus = await prisma.faqLike.findFirst({
          where: { AND: [{ user_id: user.user_id }, { faq_id: faq.faq_id }] },
        });

        await prisma.faq.update({
          where: { faq_id },
          data: { faq_viewCount: { increment: 1 } },
        });

        faq.faq_likeCount = faqLikeCount;
        faq.faq_myLikeStatus = myLikeStatus ? myLikeStatus.fl_like : false;

        return faq;
      } catch (e) {
        console.log("faq 상세보기 실패. seeFAQDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

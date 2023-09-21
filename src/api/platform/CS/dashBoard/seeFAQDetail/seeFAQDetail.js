import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeFAQDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { faq_id } = args;
      try {
        const faq = await prisma.faq.findUnique({ where: { faq_id } });

        await prisma.faq.update({
          where: { faq_id },
          data: { faq_viewCount: faq.faq_viewCount + 1 },
        });

        return faq;
      } catch (e) {
        console.log("faq 상세보기 실패. seeFAQDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

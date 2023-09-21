import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeFAQAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { orderby, take, cursor } = args;
      try {
        const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        if (!loginAdmin) throw 1;

        const totalFaqList = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          orderBy: { faq_createdAt: orderby },
        });

        if (!totalFaqList.length)
          return {
            totalLength: 0,
            faqList: [],
          };

        const cursorId = totalFaqList[cursor].faq_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { faq_id: cursorId } };

        const faqList = await prisma.faq.findMany({
          where: { faq_isDelete: false },
          ...cursorOpt,
          orderBy: { faq_createdAt: orderby },
        });

        const faqListTimeConv = faqList.map((faq) => {
          faq.faq_createdAt = new Date(faq.faq_createdAt).toISOString();
          faq.faq_updatedAt = new Date(faq.faq_updatedAt).toISOString();

          return faq;
        });

        return {
          totalLength: totalFaqList.length ? totalFaqList.length : 0,
          faqList: faqList.length ? faqListTimeConv : [],
        };
      } catch (e) {
        console.log("자주묻는질문 목록 조회 실패. seeFAQAdmin ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

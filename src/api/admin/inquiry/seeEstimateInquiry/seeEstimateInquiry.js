import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeEstimateInquiry: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { answerStatus, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const totalEstimateInquiry = await prisma.estimateInquiry.findMany({
          where: {
            ei_answerStatus: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false,
          },
        });

        if (!totalEstimateInquiry.length)
          return {
            totalLength: 0,
            estimateInquiryList: [],
          };

        const cursorId = totalEstimateInquiry[cursor].ei_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { ei_id: cursorId } };

        const estimateInquiryList = await prisma.estimateInquiry.findMany({
          where: {
            ei_answerStatus: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false,
          },
          ...cursorOpt,
          orderBy: { ei_createdAt: "desc" },
        });

        const convEstimateInquiryList = estimateInquiryList.map((eil) => {
          eil.ei_createdAt = new Date(eil.ei_createdAt).toISOString();
          return eil;
        });

        return {
          totalLength: totalEstimateInquiry.length ? totalEstimateInquiry.length : 0,
          estimateInquiryList: estimateInquiryList.length ? convEstimateInquiryList : [],
        };
      } catch (e) {
        console.log("견적문의 내용 조회 실패. seeEstimateInquiry", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

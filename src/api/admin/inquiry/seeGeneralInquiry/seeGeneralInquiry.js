import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeGeneralInquiry: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { answerStatus, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const totalGeneralInquiry = await prisma.generalInquiry.findMany({
          where: {
            gi_answerStatus: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false,
          },
          orderBy: { gi_createdAt: "desc" },
        });

        if (!totalGeneralInquiry.length)
          return {
            totalLength: 0,
            generalInquiryList: [],
          };

        const cursorId = totalGeneralInquiry[cursor].gi_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { gi_id: cursorId } };

        const generalInquiryList = await prisma.generalInquiry.findMany({
          where: {
            gi_answerStatus: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false,
          },
          ...cursorOpt,
          orderBy: { gi_createdAt: "desc" },
        });

        const convGeneralInquiryList = generalInquiryList.map((gil) => {
          gil.gi_createdAt = new Date(gil.gi_createdAt).toISOString();
          return gil;
        });

        return {
          totalLength: totalGeneralInquiry.length ? totalGeneralInquiry.length : 0,
          generalInquiryList: generalInquiryList.length ? convGeneralInquiryList : [],
        };
      } catch (e) {
        console.log("홈페이지 서비스 내용 상세 조회 실패. seeGeneralInquiry", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

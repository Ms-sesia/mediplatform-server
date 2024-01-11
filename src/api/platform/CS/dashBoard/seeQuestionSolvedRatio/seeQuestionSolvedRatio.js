import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeQuestionSolvedRatio: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        // 전체 질문 수
        const totalInquiryCount = await prisma.oneOnOne.count({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { oneq_isDelete: false }],
          },
        });

        // 답변으로 등록이 여러개 달려도 하나로 확인
        const ansCount = await prisma.oneOnOne.count({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { oneOnOneAnswer: { some: { oneAn_adminAble: true } } },
              { oneq_isDelete: false },
            ],
          },
        });

        const solvedRatio = totalInquiryCount ? Number(((ansCount / totalInquiryCount) * 100).toFixed(0)) : 0;

        return {
          solvedRatio,
          solvedQuestion: ansCount,
          registQuestion: totalInquiryCount,
        };
      } catch (e) {
        console.log("질문 해결률 조회 실패. seeQuestionSolvedRatio ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

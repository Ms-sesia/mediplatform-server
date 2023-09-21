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

        const ansCount = await prisma.oneOnOneAnswer.count({
          where: {
            AND: [
              { oneOnOne: { hospital: { hsp_id: user.hospital.hsp_id } } },
              { oneAn_isDelete: false },
              { oneAn_adminAble: true },
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

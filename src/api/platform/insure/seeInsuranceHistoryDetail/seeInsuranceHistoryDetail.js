import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeInsuranceHistoryDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ih_id } = args;
      try {
        const ih = await prisma.insuranceHistory.findUnique({ where: { ih_id } });
        const ihText = await prisma.ihText.findMany({
          where: { ih_id },
          orderBy: { iht_createdAt: "desc" },
        });

        return {
          ih_createdAt: ih.ih_createdAt,
          status: ih.ih_status,
          ihTextList: ihText.length ? ihText : [],
        };
      } catch (e) {
        console.log("청구기록 상세 및 처리내용 조회 실패. seeInsuranceHistoryDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

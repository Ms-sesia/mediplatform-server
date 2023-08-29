import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeMedicalSubjectDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ms_id } = args;
      try {
        const msDetailInfo = await prisma.medicalSubjectDetail.findMany({
          where: { AND: [{ ms_id }, { msd_isDelete: false }] },
          // select: {
          //   msd_id: true,
          //   msd_name: true,
          // },
          orderBy: { msd_name: "asc" },
        });

        if (!msDetailInfo.length)
          return {
            totalLength: 0,
            medicalSubjectDetailList: [],
          };

        return {
          totalLength: msDetailInfo.length ? msDetailInfo.length : 0,
          medicalSubjectDetailList: msDetailInfo.length ? msDetailInfo : [],
        };
      } catch (e) {
        console.log("소분류 조회 실패. seeMedicalSubjectDetail ==>\n", e);
        throw new Error("소분류 조회에 실패하였습니다.");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeMedicalSubject: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const medicalSubjectInfo = await prisma.medicalSubject.findMany({
          where: { AND: [{ ms_isDelete: false }, { hsp_id: user.hospital.hsp_id }] },
          orderBy: { ms_name: "asc" },
        });

        if (!medicalSubjectInfo.length)
          return {
            totalLength: 0,
            medicalSubjectList: [],
          };

        return {
          totalLength: medicalSubjectInfo.length ? medicalSubjectInfo.length : 0,
          medicalSubjectList: medicalSubjectInfo.length ? medicalSubjectInfo : [],
        };
      } catch (e) {
        console.log("대분류 진료항목 보기 실패. seeMedicalSubject ==>\n", e);
        throw new Error("대분류 진료항목 보기에 실패하였습니다.");
      }
    },
  },
};

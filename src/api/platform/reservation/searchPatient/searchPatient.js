import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    searchPatient: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm } = args;
      try {
        const searchPatient = await prisma.patient.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { pati_name: { contains: searchTerm } }, { pati_isDelete: false }],
          },
          select: {
            pati_id: true,
            pati_name: true,
            pati_rrn: true,
            pati_cellphone: true,
            pati_chartNumber: true,
          },
          orderBy: { pati_name: "asc" },
        });

        if (!searchPatient.length)
          return {
            totalLength: 0,
            patientList: [],
          };

        return {
          totalLength: searchPatient.length ? searchPatient.length : 0,
          patientList: searchPatient.length ? searchPatient : [],
        };
      } catch (e) {
        console.log("환자 검색 실패. searchPatient ==>\n", e);
        throw new Error("환자 검색에 실패하였습니다.");
      }
    },
  },
};

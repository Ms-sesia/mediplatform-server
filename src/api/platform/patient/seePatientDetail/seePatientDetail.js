import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seePatientDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pati_id } = args;
      try {
        const patientInfo = await prisma.patient.findUnique({
          where: { pati_id },
          select: {
            pati_name: true,
            pati_rrn: true,
            pati_cellphone: true,
            pati_chartNumber: true,
            reservation: {
              select: {
                re_desireDate: true,
                re_desireTime: true,
                re_status: true,
                re_oneLineMem: true,
              },
              orderBy: { re_desireDate: "desc" },
            },
          },
        });

        const resList = patientInfo.reservation.map((res) => {
          res.re_desireDate = new Date(res.re_desireDate).toISOString();
          return res;
        });

        return {
          pati_name: patientInfo.pati_name,
          pati_rrn: patientInfo.pati_rrn,
          pati_cellphone: patientInfo.pati_cellphone,
          pati_chartNumber: patientInfo.pati_chartNumber,
          resList: patientInfo.reservation.length ? resList : [],
        };
      } catch (e) {
        console.log("환자정보 상세 조회 실패. seePatientDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

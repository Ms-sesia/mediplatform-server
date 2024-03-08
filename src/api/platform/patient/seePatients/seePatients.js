import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seePatients: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, searchStartDate, searchEndDate, orderBy, take, cursor } = args;
      try {
        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        const splitSS = searchStartDate.split("T")[0].split("-");
        const splitSE = searchEndDate.split("T")[0].split("-");

        const searchStart = new Date(Number(splitSS[0]), Number(splitSS[1]) - 1, Number(splitSS[2]));
        const searchEnd = new Date(Number(splitSE[0]), Number(splitSE[1]) - 1, Number(splitSE[2]) + 1);

        const totalPatientInfo = await prisma.reservation.findMany({
          distinct: ["pati_id"],
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_isDelete: false },
              { re_resDate: { gte: searchStart, lt: searchEnd } },
              {
                OR: [
                  { re_patientName: { contains: searchTerm } },
                  { re_patientCellphone: { contains: searchTerm } },
                  { patient: { pati_chartNumber: { contains: searchTerm } } },
                ],
              },
              { pati_id: { not: null } },
            ],
          },
          orderBy: { re_resDate: orderBy },
        });

        if (!totalPatientInfo.length)
          return {
            totalLength: 0,
            patientList: [],
          };

        const cursorId = totalPatientInfo[cursor].re_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { re_id: cursorId } };

        const resPatientInfo = await prisma.reservation.findMany({
          distinct: ["pati_id"],
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_isDelete: false },
              // { patient: { pati_isDelete: false } },
              { re_resDate: { gte: searchStart, lt: searchEnd } },
              {
                OR: [
                  { re_patientName: { contains: searchTerm } },
                  { re_patientCellphone: { contains: searchTerm } },
                  { patient: { pati_chartNumber: { contains: searchTerm } } },
                ],
              },
              { pati_id: { not: null } },
            ],
          },
          select: {
            re_id: true,
            re_date: true,
            re_status: true,
            patient: {
              select: {
                pati_id: true,
                pati_name: true,
                pati_rrn: true,
                pati_cellphone: true,
                pati_chartNumber: true,
                reservation: {
                  where: { AND: [{ hsp_id: user.hospital.hsp_id }, { re_isDelete: false }] },
                  orderBy: { re_resDate: "desc" },
                  select: {
                    re_resDate: true,
                    re_oneLineMem: true,
                  },
                },
                _count: {
                  select: {
                    reservation: {
                      where: { AND: [{ hsp_id: user.hospital.hsp_id }, { re_isDelete: false }] },
                    },
                  },
                },
              },
            },
          },
          ...cursorOpt,
          orderBy: { re_resDate: orderBy },
        });

        let patientList = new Array();

        for (let i = 0; i < resPatientInfo.length; i++) {
          if (!resPatientInfo[i].patient) continue;
          const recentlyVisitDate = await prisma.reservation.findFirst({
            where: {
              AND: [
                { hsp_id: user.hospital.hsp_id },
                { pati_id: resPatientInfo[i].patient.pati_id },
                { re_status: "confirm" },
              ],
            },
            orderBy: { re_resDate: "desc" },
          });
          patientList.push({
            pati_id: resPatientInfo[i].patient.pati_id,
            visitCount: resPatientInfo[i].patient._count.reservation,
            pati_name: resPatientInfo[i].patient.pati_name,
            pati_rrn: resPatientInfo[i].patient.pati_rrn,
            pati_cellphone: resPatientInfo[i].patient.pati_cellphone,
            recentlyVisitDate: new Date(resPatientInfo[i].patient.reservation[0].re_resDate).toISOString(),
            pati_chartNumber: resPatientInfo[i].patient.pati_chartNumber,
            recentlyVisitMemo: resPatientInfo[i].patient.reservation[0].re_oneLineMem,
          });
        }
        // const patientList = resPatientInfo.map(async (res) => {
        //   if (res.patient)
        //     return {
        //       pati_id: res.patient.pati_id,
        //       visitCount: res.patient._count.reservation,
        //       pati_name: res.patient.pati_name,
        //       pati_rrn: res.patient.pati_rrn,
        //       pati_cellphone: res.patient.pati_cellphone,
        //       recentlyVisitDate: new Date(res.patient.reservation[0].re_resDate).toISOString(),
        //       pati_chartNumber: res.patient.pati_chartNumber,
        //       recentlyVisitMemo: res.patient.reservation[0].re_oneLineMem,
        //     };
        // });

        return {
          totalLength: totalPatientInfo.length ? patientList.length : 0,
          patientList: resPatientInfo.length ? patientList : [],
        };
      } catch (e) {
        console.log("환자 정보 조회 실패. seePatients ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

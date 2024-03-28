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

        const totalPatientInfo = await prisma.patient.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { pati_isDelete: false },
              { reservation: { some: { re_status: "confirm" } } },
              { reservation: { some: { re_resDate: { gte: searchStart, lt: searchEnd } } } },
              {
                OR: [
                  { pati_name: { contains: searchTerm } },
                  { pati_cellphone: { contains: searchTerm } },
                  { pati_chartNumber: { contains: searchTerm } },
                ],
              },
            ],
          },
          orderBy: { pati_name: orderBy },
        });

        if (!totalPatientInfo.length)
          return {
            totalLength: 0,
            patientList: [],
          };

        const cursorId = totalPatientInfo[cursor].pati_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { pati_id: cursorId } };

        const resPatientList = await prisma.patient.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { pati_isDelete: false },
              { reservation: { some: { re_status: "confirm" } } },
              { reservation: { some: { re_resDate: { gte: searchStart, lt: searchEnd } } } },
              {
                OR: [
                  { pati_name: { contains: searchTerm } },
                  { pati_cellphone: { contains: searchTerm } },
                  { pati_chartNumber: { contains: searchTerm } },
                ],
              },
            ],
          },
          ...cursorOpt,
          orderBy: { pati_name: orderBy },
        });

        let patientList = new Array();

        for (const patient of resPatientList) {
          if (!patient) continue;
          const visitDatesCount = await prisma.reservation.count({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { pati_id: patient.pati_id }, { re_status: "confirm" }],
            },
          });

          const resInfo = await prisma.reservation.findFirst({
            where: { AND: [{ pati_id: patient.pati_id }, { re_status: "confirm" }, { re_isDelete: false }] },
            orderBy: { re_resDate: "desc" },
          });

          patientList.push({
            pati_id: patient.pati_id,
            visitCount: visitDatesCount,
            pati_name: patient.pati_name,
            pati_rrn: patient.pati_rrn,
            pati_cellphone: patient.pati_cellphone,
            recentlyVisitDate: resInfo ? new Date(resInfo.re_resDate).toISOString() : "",
            pati_chartNumber: patient.pati_chartNumber,
            recentlyVisitMemo: resInfo ? resInfo.re_oneLineMem : "",
          });
        }

        // const totalPatientInfo = await prisma.reservation.findMany({
        //   distinct: ["pati_id"],
        //   where: {
        //     AND: [
        //       { hsp_id: user.hospital.hsp_id },
        //       { re_isDelete: false },
        //       { re_resDate: { gte: searchStart, lt: searchEnd } },
        //       { re_status: "confirm" },
        //       {
        //         OR: [
        //           { re_patientName: { contains: searchTerm } },
        //           { re_patientCellphone: { contains: searchTerm } },
        //           { patient: { pati_chartNumber: { contains: searchTerm } } },
        //         ],
        //       },
        //       { pati_id: { not: null } },
        //     ],
        //   },
        //   select: {
        //     re_id: true,
        //     re_resDate: true,
        //   },
        //   orderBy: { re_resDate: orderBy },
        // });

        // if (!totalPatientInfo.length)
        //   return {
        //     totalLength: 0,
        //     patientList: [],
        //   };

        // const cursorId = totalPatientInfo[cursor].re_id;
        // const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { re_id: cursorId } };

        // const resPatientInfo = await prisma.reservation.findMany({
        //   distinct: ["pati_id"],
        //   where: {
        //     AND: [
        //       { hsp_id: user.hospital.hsp_id },
        //       { re_isDelete: false },
        //       { re_resDate: { gte: searchStart, lt: searchEnd } },
        //       { re_status: "confirm" },
        //       {
        //         OR: [
        //           { re_patientName: { contains: searchTerm } },
        //           { re_patientCellphone: { contains: searchTerm } },
        //           { patient: { pati_chartNumber: { contains: searchTerm } } },
        //         ],
        //       },
        //       { pati_id: { not: null } },
        //     ],
        //   },
        //   select: {
        //     re_id: true,
        //     re_date: true,
        //     re_status: true,
        //     re_resDate: true,
        //     re_oneLineMem: true,
        //     patient: {
        //       select: {
        //         pati_id: true,
        //         pati_name: true,
        //         pati_rrn: true,
        //         pati_cellphone: true,
        //         pati_chartNumber: true,
        //       },
        //     },
        //   },
        //   ...cursorOpt,
        //   orderBy: { re_resDate: orderBy },
        // });

        // let patientList = new Array();

        // for (const resPatient of resPatientInfo) {
        //   if (!resPatient.patient) continue;
        //   const visitDatesCount = await prisma.reservation.count({
        //     where: {
        //       AND: [
        //         { hsp_id: user.hospital.hsp_id },
        //         { pati_id: resPatient.patient.pati_id },
        //         { re_status: "confirm" },
        //       ],
        //     },
        //   });

        //   patientList.push({
        //     pati_id: resPatient.patient.pati_id,
        //     visitCount: visitDatesCount,
        //     pati_name: resPatient.patient.pati_name,
        //     pati_rrn: resPatient.patient.pati_rrn,
        //     pati_cellphone: resPatient.patient.pati_cellphone,
        //     recentlyVisitDate: new Date(resPatient.re_resDate).toISOString(),
        //     pati_chartNumber: resPatient.patient.pati_chartNumber,
        //     recentlyVisitMemo: resPatient.re_oneLineMem,
        //   });
        // }

        return {
          totalLength: totalPatientInfo.length ? patientList.length : 0,
          // patientList: resPatientInfo.length ? patientList : [],
          patientList: resPatientList.length ? patientList : [],
        };
      } catch (e) {
        console.log("환자 정보 조회 실패. seePatients ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seeReservationList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, searchDate, status, doctorRoom, resPlatform, visitConfirm, largeCategory, take, cursor } =
        args;
      try {
        const today = new Date();
        const searchDateConv = new Date(searchDate);
        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        const totalRes = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: searchDateConv.getFullYear() },
              { re_month: searchDateConv.getMonth() + 1 },
              { re_date: searchDateConv.getDate() },
              { re_isDelete: false },
              {
                OR: [
                  { re_patientName: { contains: searchTerm } },
                  { re_patientCellphone: { contains: searchTerm } },
                  { re_patientRrn: { contains: searchTerm } },
                  { re_doctorRoomName: { contains: searchTerm } },
                ],
              },
              { re_doctorRoomName: { contains: doctorRoom === "total" ? "" : doctorRoom } },
              // 전체 상태보기에서 내원확정 미표기일 때만 표시 안함. 전체가 아니면 다 표기
              { re_status: status === "total" ? (visitConfirm ? undefined : { not: "confirm" }) : status },
              { re_platform: resPlatform === "total" ? undefined : resPlatform },
              { re_LCategory: { contains: largeCategory === "total" ? "" : largeCategory } },
            ],
          },
          orderBy: [{ re_year: "desc" }, { re_month: "desc" }, { re_date: "desc" }],
        });

        if (!totalRes.length)
          return {
            totalLength: 0,
            reservationList: [],
          };

        const cursorId = totalRes[cursor].re_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { re_id: cursorId } };

        const reservationList = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: searchDateConv.getFullYear() },
              { re_month: searchDateConv.getMonth() + 1 },
              { re_date: searchDateConv.getDate() },
              { re_isDelete: false },
              {
                OR: [
                  { re_patientName: { contains: searchTerm } },
                  { re_patientCellphone: { contains: searchTerm } },
                  { re_patientRrn: { contains: searchTerm } },
                  { re_doctorRoomName: { contains: searchTerm } },
                ],
              },
              { re_doctorRoomName: { contains: doctorRoom === "total" ? "" : doctorRoom } },
              // 전체 상태보기에서 내원확정 미표기일 때만 표시 안함. 전체가 아니면 다 표기
              { re_status: status === "total" ? (visitConfirm ? undefined : { not: "confirm" }) : status },
              { re_platform: resPlatform === "total" ? undefined : resPlatform },
              { re_LCategory: { contains: largeCategory === "total" ? "" : largeCategory } },
            ],
          },
          ...cursorOpt,
          orderBy: [{ re_year: "desc" }, { re_month: "desc" }, { re_date: "desc" }],
        });

        const reservationInfos = reservationList.map(async (res, idx) => {
          // 내원확정된 횟수
          const visitCount = await prisma.reservation.count({
            where: {
              AND: [
                //
                { hsp_id: res.hsp_id },
                { re_patientName: res.re_patientName },
                { re_isDelete: false },
                { re_status: { not: "cancel" } },
              ],
            },
          });

          const recentlyVisit = await prisma.reservation.findFirst({
            where: {
              AND: [
                { hsp_id: res.hsp_id },
                { re_isDelete: false },
                { re_patientName: res.re_patientName },
                { re_patientCellphone: res.re_patientCellphone },
                { re_status: "confirm" },
                { re_resDate: { lte: today.toISOString() } },
              ],
            },
            orderBy: [{ re_year: "desc" }, { re_month: "desc" }, { re_date: "desc" }],
          });

          let recentlyVisitDate;
          if (recentlyVisit)
            recentlyVisitDate = new Date(recentlyVisit.re_year, recentlyVisit.re_month - 1, recentlyVisit.re_date);

          let patientInfo;
          if (res.pati_id) patientInfo = await prisma.patient.findUnique({ where: { pati_id: res.pati_id } });

          const alimSet = await prisma.resAlim.findUnique({ where: { re_id: res.re_id } });

          let template;
          if (alimSet) {
            template = await prisma.resAlimTemplate.findUnique({ where: { rat_id: alimSet.ra_templateId } });
          }

          return {
            re_id: res.re_id,
            resDate: searchDateConv.toISOString(),
            desireDate: new Date(res.re_desireDate).toISOString(),
            desireTime: res.re_desireTime,
            time: res.re_time,
            doctorRoomName: res.re_doctorRoomName,
            patientName: res.re_patientName,
            patientRrn: res.re_patientRrn,
            patientCellphone: res.re_patientCellphone,
            oneLineMemo: res.re_oneLineMem,
            platform: res.re_platform,
            status: res.re_status,
            visitCount,
            recentlyVisitDate: recentlyVisitDate ? recentlyVisitDate.toISOString() : "",
            patientChartNumber: patientInfo ? patientInfo.pati_chartNumber : "",
            largeCategory: res.re_LCategory,
            smallCategory: res.re_SCategory,
            alimType: alimSet ? alimSet.ra_type : "sms",
            alimTime1: alimSet ? alimSet.ra_time1 : false,
            alimTime2: alimSet ? alimSet.ra_time2 : false,
            alimTime3: alimSet ? alimSet.ra_time3 : false,
            alimTime4: alimSet ? alimSet.ra_time4 : false,
            template: template ? template.rat_text : "",
          };
        });

        return {
          totalLength: totalRes.length ? totalRes.length : 0,
          reservationList: reservationInfos.length ? reservationInfos : [],
        };
      } catch (e) {
        console.log("예약 목록 조회 실패. seeReservationList ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

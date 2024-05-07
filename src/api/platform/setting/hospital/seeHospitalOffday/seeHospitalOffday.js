import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../../libs/searchHistory";
import { weekdays } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        searchTerm,
        year,
        month,
        offType,
        // take,
        //  cursor
      } = args;

      console.log("seeHospitalOffday args:", args);
      try {
        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        const startDate = new Date(year, month - 1, 1, 9);
        const endDate = new Date(year, month, 1, 9);

        let aldyMonthFixed, aldyWeekFixed;
        let fixedDays = new Array();
        let tempHospitalOffday = new Array();

        // 전체, 고정
        if (offType !== "temp") {
          aldyMonthFixed = await prisma.monthOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { fo_isDelete: false }, { fo_memo: { contains: searchTerm } }],
            },
          });
          aldyWeekFixed = await prisma.weekOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { wo_isDelete: false }, { wo_memo: { contains: searchTerm } }],
            },
          });
          fixedDays = generateFixedDaysForMonth(month, year, aldyMonthFixed, aldyWeekFixed);
        }

        // 전체, 임시
        if (offType !== "fix") {
          tempHospitalOffday = await prisma.hospitalOffday.findMany({
            where: {
              AND: [
                { hsp_id: user.hospital.hsp_id },
                { ho_isDelete: false },
                {
                  OR: [
                    { ho_offStartDate: { gte: startDate, lte: endDate } }, // 시작일
                    { ho_offEndDate: { gte: startDate, lte: endDate } }, // 종료일
                  ],
                },
                { ho_type: offType === "total" ? undefined : offType },
                { ho_memo: { contains: searchTerm } },
              ],
            },
          });
        }

        const combinedDays = [
          ...fixedDays,
          ...tempHospitalOffday.map((day) => {
            const startDate = new Date(day.ho_offStartDate);
            const endDate = new Date(day.ho_offEndDate);
            return {
              ho_id: day.ho_id,
              offType: "temp",
              startDate: startDate.toISOString(),
              startDay: weekdays[startDate.getDay()],
              endDate: endDate.toISOString(),
              endDay: weekdays[endDate.getDay()],
              // date: day.ho_offStartDate,
              // day: weekdays[date.getDay()],
              reType: "none",
              startTime: day.ho_offStartTime,
              endTime: day.ho_offEndTime,
              memo: day.ho_memo,
              createdAt: new Date(day.ho_createdAt).toISOString(),
              creatorName: day.ho_creatorName,
            };
          }),
        ];

        const sortedDays = combinedDays.sort((a, b) => a - b);

        return {
          totalLength: sortedDays.length ? sortedDays.length : 0,
          offdayList: sortedDays.length ? sortedDays : [],
        };
      } catch (e) {
        console.log("병원 쉬는날 조회 실패. seeHospitalOffday ==>\n", e);
        throw new Error("병원 쉬는날 조회에 실패하였습니다.");
      }
    },
  },
};

const generateFixedDaysForMonth = (month, year, monthOffdays, weekOffdays) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const fixedDays = [];

  // monthOffday 처리
  monthOffdays.forEach((offday) => {
    const monthStartDate = new Date(offday.fo_startDate);
    const monthEndDate = new Date(offday.fo_endDate);

    const startDate = new Date(year, month - 1, monthStartDate.getDate());
    const endDate = new Date(year, month - 1, monthEndDate.getDate());

    fixedDays.push({
      ho_id: offday.fo_id,
      offType: "fix", //휴무구분 (임시, 고정)
      startDate: startDate.toISOString(),
      startDay: weekdays[startDate.getDay()],
      endDate: endDate.toISOString(),
      endDay: weekdays[endDate.getDay()],
      reType: "month", // 반복 구분
      startTime: offday.fo_startTime,
      endTime: offday.fo_endTime,
      memo: offday.fo_memo,
      createdAt: new Date(offday.fo_createdAt).toISOString(),
      creatorName: offday.fo_creatorName,
    });
  });

  // weekOffday 처리
  weekOffdays.forEach((offday) => {
    for (let day = 1; day <= daysInMonth; day++) {
      const startDate = new Date(offday.wo_startDate);
      const endDate = new Date(offday.wo_endDate);
      const date = new Date(year, month - 1, day);
      if (date.getDay() >= offday.wo_startDate.getDay() && date.getDay() <= offday.wo_endDate.getDay()) {
        fixedDays.push({
          ho_id: offday.wo_id,
          offType: "fix", //휴무구분 (임시, 고정)
          // startDate: startDate.toISOString(),
          startDate: date.toISOString(),
          startDay: weekdays[startDate.getDay()],
          // endDate: endDate.toISOString(),
          endDate: date.toISOString(),
          endDay: weekdays[endDate.getDay()],
          // date,
          // day: weekdays[date.getDay()],
          reType: "week", // 반복 구분
          startTime: offday.wo_startTime,
          endTime: offday.wo_endTime,
          memo: offday.wo_memo,
          createdAt: new Date(offday.wo_createdAt).toISOString(),
          creatorName: offday.wo_creatorName,
        });
      }
    }
  });

  return fixedDays.sort((a, b) => a.date - b.date);
};

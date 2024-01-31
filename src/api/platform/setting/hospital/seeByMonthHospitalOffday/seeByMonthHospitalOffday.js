import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../../libs/searchHistory";
import { weekdays, weekdays_eng } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByMonthHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, year, month, offType } = args;
      try {
        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        const startDate = new Date(year, month - 1, 1, 9);
        const endDate = new Date(year, month, 1, 9);

        let aldyMonthFixed, aldyWeekFixed;
        let tempHospitalOffday = new Array();
        // let fixedDays = new Array();
        let tempOffdays = new Array();

        // 고정 휴무
        if (offType !== "temp") {
          aldyMonthFixed = await prisma.monthOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { fo_isDelete: false }, { fo_memo: { contains: searchTerm } }],
            },
          });
          // 주별 고정 휴무
          aldyWeekFixed = await prisma.weekOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { wo_isDelete: false }, { wo_memo: { contains: searchTerm } }],
            },
          });
        }

        // 임시 휴무
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

        const offDays = combineOffDays(year, month, aldyMonthFixed, aldyWeekFixed, tempHospitalOffday);

        const hospitalWorkSchedule = await prisma.defaultSchedule.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { ds_isDelete: false }] },
        });

        const monthSchedule = combineSchedule(year, month, hospitalWorkSchedule, offDays);

        return monthSchedule.length ? monthSchedule : [];
      } catch (e) {
        console.log("월별 병원 휴무일정 조회 실패. seeByMonthHospitalOffday ==>\n", e);
        throw new Error("err_01"); // 월별 병원 휴무일정 조회 실패하였습니다.
      }
    },
  },
};

const combineOffDays = (year, month, monthOffdays, weekOffdays, tempHospitalOffday) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const fixedDays = [];
  for (let day = 1; day <= daysInMonth; day++) {
    // monthOffday 처리
    monthOffdays.forEach((offday) => {
      const startDate = new Date(offday.fo_startDate);
      const endDate = new Date(offday.fo_endDate);

      // 월 휴무 시작일 < 진행 날짜 < 월 휴무 종료일  -- 휴무일이 진행일 중 해당할 경우
      if (day >= startDate.getDate() && day <= endDate.getDate()) {
        fixedDays.push({
          month,
          date: day,
          workType: "offDay",
          workStartHour: 0,
          workStartMin: 0,
          workEndHour: 0,
          workEndMin: 0,
          offType: "fix",
          reType: "month",
        });
      }
    });

    // weekOffday 처리
    weekOffdays.forEach((offday) => {
      const startDate = new Date(offday.wo_startDate);
      const endDate = new Date(offday.wo_endDate);
      const date = new Date(year, month - 1, day);
      //주간 휴무 사이일 경우
      if (date.getDay() >= startDate.getDay() && date.getDay() <= endDate.getDay()) {
        fixedDays.push({
          month,
          date: day,
          workType: "offDay",
          workStartHour: 0,
          workStartMin: 0,
          workEndHour: 0,
          workEndMin: 0,
          offType: "fix",
          reType: "week",
        });
      }
    });

    // tempOffday 처리
    tempHospitalOffday.forEach((offday) => {
      const startDate = new Date(offday.ho_offStartDate);
      const endDate = new Date(offday.ho_offEndDate);
      // 휴무일이 진행일 중 해당할 경우
      if (day >= startDate.getDate() && day <= endDate.getDate()) {
        fixedDays.push({
          month,
          date: day,
          workType: "offDay",
          workStartHour: 0,
          workStartMin: 0,
          workEndHour: 0,
          workEndMin: 0,
          offType: "temp",
          reType: "none",
        });
      }
    });
  }

  return fixedDays.sort((a, b) => a.date - b.date);
};

const combineSchedule = (year, month, hospitalWorkSchedule, offDays) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthSchedule = [];

  for (let date = 1; date <= daysInMonth; date++) {
    const day = new Date(year, month - 1, date).getDay();
    const day_eng = weekdays_eng[day];
    const scheduleDayIndex = hospitalWorkSchedule.findIndex((hspSchedule) => hspSchedule.ds_day === day_eng);
    const fixedDayIndices = offDays.filter((fDays) => fDays.date === date && fDays.offType === "fix");
    const tempDayIndices = offDays.filter((fDays) => fDays.date === date && fDays.offType === "temp");

    if (tempDayIndices.length) {
      // 일시적인 휴무일이 있으면 그것을 우선순위로 추가
      monthSchedule.push({ ...tempDayIndices[0], scheduleCheck: true });
    } else if (fixedDayIndices.length) {
      // 고정된 휴무일이 있다면 추가
      monthSchedule.push({ ...fixedDayIndices[0], scheduleCheck: true });
    } else {
      // 그렇지 않으면 일반 근무일을 추가
      monthSchedule.push({
        month,
        date,
        workType: "work",
        workStartHour: hospitalWorkSchedule[scheduleDayIndex] ? hospitalWorkSchedule[scheduleDayIndex].ds_startHour : 0,
        workStartMin: hospitalWorkSchedule[scheduleDayIndex] ? hospitalWorkSchedule[scheduleDayIndex].ds_startMin : 0,
        workEndHour: hospitalWorkSchedule[scheduleDayIndex] ? hospitalWorkSchedule[scheduleDayIndex].ds_endHour : 0,
        workEndMin: hospitalWorkSchedule[scheduleDayIndex] ? hospitalWorkSchedule[scheduleDayIndex].ds_endMin : 0,
        offType: "temp",
        reType: "none",
        scheduleCheck: hospitalWorkSchedule.length ? true : false,
      });
    }
  }

  return monthSchedule;
};

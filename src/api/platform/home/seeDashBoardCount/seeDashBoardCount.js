import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDashBoardCount: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const today = new Date();

        const thisMonthResCount = await prisma.reservation.count({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: today.getFullYear() },
              { re_month: today.getMonth() + 1 },
              { re_isDelete: false },
              { re_status: { not: "cancel" } },
            ],
          },
        });

        const currentWeek = getCurrentWeekDates();

        const thisWeekResCount = await prisma.reservation.count({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_resDate: { gte: currentWeek[0], lte: currentWeek[6] } },
              { re_isDelete: false },
              { re_status: { not: "cancel" } },
            ],
          },
        });

        const todayResCount = await prisma.reservation.count({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: today.getFullYear() },
              { re_month: today.getMonth() + 1 },
              { re_date: today.getDate() },
              { re_isDelete: false },
              { re_status: { not: "cancel" } },
            ],
          },
        });

        const thisMonthSpecialScheduleCount = await prisma.specialSchedule.count({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { ss_startYear: today.getFullYear() },
              { OR: [{ ss_startMonth: today.getMonth() + 1 }, { ss_endDate: today.getMonth() + 1 }] },
              { ss_isDelete: false },
            ],
          },
        });

        const hospitalNoticeCount = await prisma.hospitalNotice.count({
          where: { hsp_id: user.hospital.hsp_id },
        });

        return {
          thisMonthResCount,
          thisWeekResCount,
          todayResCount,
          thisMonthSpecialScheduleCount,
          hospitalNoticeCount,
        };
      } catch (e) {
        console.log("대시보드 요약 통계 조회 실패. seeDashBoardCount ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

const getCurrentWeekDates = () => {
  const today = new Date();
  const todayDay = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - todayDay);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - todayDay));

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    weekDates.push(currentDay);
  }

  return weekDates;
};

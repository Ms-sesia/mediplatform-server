import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeThisYearReservationStatistics: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const todayYear = new Date().getFullYear();
        const monthOfYear = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

        const byMonthCount = monthOfYear.map(async (month) => {
          const startDate = new Date(todayYear, month - 1, 1, 9);
          const endDate = new Date(todayYear, month, 1, 9);

          const resCountByMonth = await prisma.reservation.count({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { re_resDate: { gte: startDate, lte: endDate } }],
            },
          });

          return {
            month,
            count: resCountByMonth,
          };
        });

        const manCount = await prisma.reservation.count({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { patient: { pati_gender: true } }, { re_year: todayYear }],
          },
        });
        const womanCount = await prisma.reservation.count({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { patient: { pati_gender: false } }, { re_year: todayYear }],
          },
        });

        return {
          year: todayYear,
          manCount,
          womanCount,
          byMonthCount,
        };
      } catch (e) {
        console.log("예약 환자 통계 조회 실패. seeThisYearReservationStatistics ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeTodayReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const today = new Date();

        const todayResList = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: today.getFullYear() },
              { re_month: today.getMonth() + 1 },
              { re_date: today.getDate() },
              { re_isDelete: false },
            ],
          },
        });

        if (!todayResList.length)
          return {
            totalResCount: 0,
            todayResInfo: [],
          };

        return {
          totalResCount: todayResList.length ? todayResList.length : 0,
          todayResInfo: todayResList.length ? todayResList : [],
        };
      } catch (e) {
        console.log("오늘의 예약 환자 조회 실패. seeTodayReservation ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

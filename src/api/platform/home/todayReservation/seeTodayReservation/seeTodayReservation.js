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

        const resList = timeSort(todayResList);

        return {
          totalResCount: todayResList.length ? todayResList.length : 0,
          todayResInfo: todayResList.length ? resList : [],
        };
      } catch (e) {
        console.log("오늘의 예약 환자 조회 실패. seeTodayReservation ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

const timeSort = (data) => {
  data.sort((a, b) => {
    // "HH:MM" 형식의 문자열을 시간과 분으로 나눕니다.
    let aHour = parseInt(a.re_time.split(":")[0]);
    let aMinute = parseInt(a.re_time.split(":")[1]);
    let bHour = parseInt(b.re_time.split(":")[0]);
    let bMinute = parseInt(b.re_time.split(":")[1]);

    // 먼저 시간을 비교합니다.
    if (aHour < bHour) {
      return -1;
    } else if (aHour > bHour) {
      return 1;
    }

    // 시간이 같다면 분을 비교합니다.
    if (aMinute < bMinute) {
      return -1;
    } else if (aMinute > bMinute) {
      return 1;
    }

    // 시간과 분이 모두 같다면, 두 문자열은 같습니다.
    return 0;
  });

  return data;
};

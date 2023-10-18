import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDateReservationDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, month, date, doctorRoom, resPlatform } = args;
      try {
        let byDateList = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: year },
              { re_month: month },
              { re_date: date },
              // { patient: { pati_isDelete: false } },
              { re_isDelete: false },
              { re_doctorRoomName: { contains: doctorRoom === "total" ? "" : doctorRoom } },
              { re_platform: resPlatform === "total" ? undefined : resPlatform },
            ],
          },
        });

        if (!byDateList.length)
          return {
            totalResCount: 0,
            byDateReservationDetailInfo: [],
          };

        byDateList = timeSort(byDateList);

        return {
          totalResCount: byDateList.length ? byDateList.length : 0,
          byDateReservationDetailInfo: byDateList,
        };
      } catch (e) {
        console.log("일간 예약 내역 조회 실패. seeDateReservationDetail ==>\n", e);
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

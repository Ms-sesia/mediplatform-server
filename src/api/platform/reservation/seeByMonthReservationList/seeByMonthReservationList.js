import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByMonthReservationList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, year, month, status, doctorRoom, resPlatform, visitConfirm, largeCategory } = args;
      try {
        const reservationDateList = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: year },
              { re_month: month },
              { re_isDelete: false },
              // { patient: { pati_isDelete: false } },
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
          orderBy: { re_date: "desc" },
        });

        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        if (!reservationDateList.length) return [];

        let byMonthData = transformData(reservationDateList);
        const byMonthDataSort = byMonthData.map((monData) => {
          const sortMonData = timeSort(monData.byDateReservationInfo);
          return sortMonData;
        });

        return byMonthData;
      } catch (e) {
        console.log("월간 예약 내역 조회 실패. seeByMonthReservationList ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

const transformData = (data) => {
  // 일자별로 데이터를 그룹화합니다.
  let dateGrouped = data.reduce((acc, resData, idx) => {
    if (!acc[resData.re_date]) {
      acc[resData.re_date] = [];
    }
    acc[resData.re_date].push(resData);
    return acc;
  }, {});

  // 변환된 데이터를 결과 배열로 변환합니다.
  let result = [];
  for (let date in dateGrouped) {
    const byDateInfo = dateGrouped[date].map((resData) => ({
      re_id: resData.re_id,
      re_platform: resData.re_platform,
      re_time: resData.re_time,
      re_patientName: resData.re_patientName,
      re_status: resData.re_status,
      re_LCategory: resData.re_LCategory,
      re_SCategory: resData.re_SCategory,
    }));

    result.push({
      date: parseInt(date),
      totalResCount: dateGrouped[date].length,
      byDateReservationInfo: byDateInfo,
    });
  }

  // 일자별로 정렬합니다.
  result.sort((a, b) => a.date - b.date);
  return result;
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

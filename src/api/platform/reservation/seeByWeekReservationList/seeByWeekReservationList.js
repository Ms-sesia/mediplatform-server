import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByWeekReservationList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, year, month, date, status, doctorRoom, resPlatform, visitConfirm, largeCategory } = args;
      try {
        const weekResInfo = new Array();

        for (let i = 0; i < 7; i++) {
          const getDate = new Date(year, month - 1, date + i);
          const searchYear = getDate.getFullYear();
          const searchMonth = getDate.getMonth() + 1;
          const searchDate = getDate.getDate();

          const resInfo = await prisma.reservation.findMany({
            where: {
              AND: [
                { hsp_id: user.hospital.hsp_id },
                { re_year: searchYear },
                { re_month: searchMonth },
                { re_date: searchDate },
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

          weekResInfo.push({
            year: searchYear,
            month: searchMonth,
            date: searchDate,
            byDateReservationInfo: resInfo,
          });
        }

        if (!weekResInfo.length) return [];

        return weekResInfo.length ? weekResInfo : [];
      } catch (e) {
        console.log("월간 예약 내역 조회 실패. seeByWeekReservationList ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

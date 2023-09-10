import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDateReservationDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, month, date, doctorRoom, resPlatform } = args;
      try {
        const byDateList = await prisma.reservation.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { re_year: year },
              { re_month: month },
              { re_date: date },
              { patient: { pati_isDelete: false } },
              { re_isDelete: false },
              { re_doctorRoomName: { contains: doctorRoom } },
              { re_platform: resPlatform === "total" ? undefined : resPlatform },
            ],
          },
        });

        if (!byDateList.length)
          return {
            totalResCount: 0,
            byDateReservationDetailInfo: [],
          };

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

import { PrismaClient } from "@prisma/client";
import { weekdays_eng } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByDaySchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchDate } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const today = new Date(searchDate);
        const DayofWeek = weekdays_eng[today.getDay()];

        const hspSchedule = await prisma.defaultSchedule.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { ds_day: DayofWeek }] },
        });

        console.log(hspSchedule);
        return true;
      } catch (e) {
        console.log("일별 운영 스케쥴 조회 실패. seeByDaySchedule ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

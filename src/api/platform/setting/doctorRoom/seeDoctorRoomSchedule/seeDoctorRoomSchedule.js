import { PrismaClient } from "@prisma/client";
import { getDayIndex } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDoctorRoomSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dr_id } = args;
      try {
        const drRoomSchedule = await prisma.doctorRoomSchedule.findMany({
          where: { AND: [{ dr_id }, { drs_isDelete: false }] },
          select: {
            drs_id: true,
            drs_day: true,
            drs_startHour: true,
            drs_startMin: true,
            drs_endHour: true,
            drs_endMin: true,
            drs_lunchBreak: true,
            drs_lbStartHour: true,
            drs_lbStartMin: true,
            drs_lbEndHour: true,
            drs_lbEndMin: true,
          },
        });

        // console.log(drRoomSchedule);

        // drs_day 값을 기준으로 정렬
        drRoomSchedule.sort((a, b) => getDayIndex(a.drs_day) - getDayIndex(b.drs_day));

        return drRoomSchedule.length ? drRoomSchedule : [];
      } catch (e) {
        console.log("진료실 별 스케쥴 조회 실패. seeDoctorRoomSchedule ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

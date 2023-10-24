import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateDoctorRoomSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        drs_id,
        day,
        startHour,
        startMin,
        endHour,
        endMin,
        lunchBreak,
        lunchBreakStartHour,
        lunchBreakStartMin,
        lunchBreakEndHour,
        lunchBreakEndMin,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.doctorRoomSchedule.update({
          where: { drs_id },
          data: {
            drs_editorId: loginUser.user_id,
            drs_editorName: loginUser.user_name,
            drs_editorRank: loginUser.user_rank,
            drs_day: day,
            drs_startHour: startHour,
            drs_startMin: startMin,
            drs_endHour: endHour,
            drs_endMin: endMin,
            drs_lunchBreak: lunchBreak,
            drs_lbStartHour: lunchBreakStartHour,
            drs_lbStartMin: lunchBreakStartMin,
            drs_lbEndHour: lunchBreakEndHour,
            drs_lbEndMin: lunchBreakEndMin,
          },
        });

        return true;
      } catch (e) {
        console.log("진료실 스케쥴 수정 실패. updateDoctorRoomSchedule", e);
        throw new Error("err_00");
      }
    },
  },
};

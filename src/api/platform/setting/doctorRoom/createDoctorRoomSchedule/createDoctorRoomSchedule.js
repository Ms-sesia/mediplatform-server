import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDoctorRoomSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        dr_id,
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

        // const drSchedule = await prisma.doctorRoomSchedule.findMany({
        //   where: { AND: [{ drs_day: day }, { drs_isDelete: false }] },
        // });

        // if (drSchedule.length) throw 1;

        await prisma.doctorRoomSchedule.create({
          data: {
            drs_creatorId: loginUser.user_id,
            drs_creatorName: loginUser.user_name,
            drs_creatorRank: loginUser.user_rank,
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
            doctorRoom: { connect: { dr_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("진료실 기본 일정 추가 실패. createDoctorRoomSchedule", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

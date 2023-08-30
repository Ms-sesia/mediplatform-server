import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDefaultSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        hsp_id,
        ds_day,
        ds_startHour,
        ds_startMin,
        ds_endHour,
        ds_endMin,
        ds_lunchBreak,
        ds_lbStartHour,
        ds_lbStartMin,
        ds_lbEndHour,
        ds_lbEndMin,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.defaultSchedule.create({
          data: {
            ds_creatorId: loginUser.user_id,
            ds_creatorName: loginUser.user_name,
            ds_creatorRank: loginUser.user_rank,
            ds_day,
            ds_startHour,
            ds_startMin,
            ds_endHour,
            ds_endMin,
            ds_lunchBreak,
            ds_lbStartHour,
            ds_lbStartMin,
            ds_lbEndHour,
            ds_lbEndMin,
            hospital: { connect: { hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("병원 기본 스케쥴 추가 실패. createDefaultSchedule", e);
        throw new Error("병원 기본 스케쥴 추가에 실패하였습니다.");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDefaultSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
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

        const ds = await prisma.defaultSchedule.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { ds_isDelete: false }, { ds_day }],
          },
        });

        if (ds.length) throw 1;

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
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("병원 기본 스케쥴 추가 실패. createDefaultSchedule", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

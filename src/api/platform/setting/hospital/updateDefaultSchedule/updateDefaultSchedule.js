import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateDefaultSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        ds_id,
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

        await prisma.defaultSchedule.update({
          where: { ds_id },
          data: {
            ds_editorId: loginUser.user_id,
            ds_editorName: loginUser.user_name,
            ds_editorRank: loginUser.user_rank,
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
        console.log("병원 기본 운영 스케쥴 수정 실패. updateDefaultSchedule", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00"); // 병원 기본 운영 스케쥴 수정 실패
      }
    },
  },
};

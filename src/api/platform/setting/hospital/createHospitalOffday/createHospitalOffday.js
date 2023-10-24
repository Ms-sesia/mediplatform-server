import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ho_type, ho_offStartDate, ho_offEndDate, ho_offStartTime, ho_offEndTime, ho_offdayRepeat, ho_memo } =
        args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const start = new Date(ho_offStartDate);
        const end = new Date(ho_offEndDate);

        switch (ho_offdayRepeat) {
          case "none":
            await prisma.hospitalOffday.create({
              data: {
                ho_creatorId: loginUser.user_id,
                ho_creatorName: loginUser.user_name,
                ho_creatorRank: loginUser.user_rank,
                ho_type,
                ho_offStartDate: start,
                ho_offEndDate: end,
                ho_offStartTime,
                ho_offEndTime,
                ho_offdayRepeat,
                ho_memo,
                hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              },
            });
            break;
          case "week":
            await prisma.weekOffday.create({
              data: {
                wo_creatorId: loginUser.user_id,
                wo_creatorName: loginUser.user_name,
                wo_creatorRank: loginUser.user_rank,
                wo_startDate: start,
                wo_endDate: end,
                wo_startTime: ho_offStartTime,
                wo_endTime: ho_offEndTime,
                wo_memo: ho_memo,
                hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              },
            });
            break;
          case "month":
            await prisma.monthOffday.create({
              data: {
                fo_creatorId: loginUser.user_id,
                fo_creatorName: loginUser.user_name,
                fo_creatorRank: loginUser.user_rank,
                fo_startDate: start,
                fo_endDate: end,
                fo_startTime: ho_offStartTime,
                fo_endTime: ho_offEndTime,
                fo_memo: ho_memo,
                hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              },
            });
            break;
        }

        return true;
      } catch (e) {
        console.log("병원 쉬는날 등록 실패. createHospitalOffday", e);
        throw new Error("병원 쉬는날 등록에 실패하였습니다.");
      }
    },
  },
};

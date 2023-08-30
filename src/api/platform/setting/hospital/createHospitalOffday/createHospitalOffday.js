import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospitalOffday: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        hsp_id,
        ho_type,
        ho_offStartDate,
        ho_offEndDate,
        ho_offStartTime,
        ho_offEndTime,
        ho_offdayRepeat,
        ho_memo,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.hospitalOffday.create({
          data: {
            ho_creatorId: loginUser.user_id,
            ho_creatorName: loginUser.user_name,
            ho_creatorRank: loginUser.user_rank,
            ho_type,
            ho_offStartDate,
            ho_offEndDate,
            ho_offStartTime,
            ho_offEndTime,
            ho_offdayRepeat,
            ho_memo,
            hospital: { connect: { hsp_id } },
          },
        });
        return true;
      } catch (e) {
        console.log("병원 쉬는날 등록 실패. createHospitalOffday", e);
        throw new Error("병원 쉬는날 등록에 실패하였습니다.");
      }
    },
  },
};

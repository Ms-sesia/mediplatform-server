import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateRankPermission: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { rank_id, rp_reservation, rp_schedule, rp_patient, rp_did, rp_insurance, rp_cs, rp_setting } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.rankPermission.update({
          where: { rank_id },
          data: {
            rp_editorId: loginUser.user_id,
            rp_editorName: loginUser.user_name,
            rp_editorRank: loginUser.user_rank,
            rp_reservation,
            rp_schedule,
            rp_patient,
            rp_did,
            rp_insurance,
            rp_cs,
            rp_setting,
          },
        });

        return true;
      } catch (e) {
        console.log("직책 권한 수정 실패. updateRankPermission", e);
        throw new Error("직책 권한 수정에 실패하였습니다.");
      }
    },
  },
};

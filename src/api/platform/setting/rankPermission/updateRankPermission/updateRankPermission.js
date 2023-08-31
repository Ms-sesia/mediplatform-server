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

        const rankP = await prisma.rankPermission.update({
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

        const rank = await prisma.rank.findUnique({ where: { rank_id } });

        await prisma.userPermission.updateMany({
          where: {
            AND: [{ user: { hsp_id: rank.hsp_id } }, { user: { user_rank: { contains: rank.rank_name } } }],
          },
          data: {
            up_reservation: rp_reservation,
            up_schedule: rp_schedule,
            up_patient: rp_patient,
            up_did: rp_did,
            up_insurance: rp_insurance,
            up_cs: rp_cs,
            up_setting: rp_setting,
          },
        });

        const updateUsers = await prisma.user.findMany({
          where: { AND: [{ hsp_id: rank.hsp_id }, { user_rank: { contains: rank.rank_name } }] },
        });

        updateUsers.map(async (user) => {
          await prisma.userUpdateLog.create({
            data: {
              ul_name: user.user_name,
              ul_content: "직책 권한설정 변경에 따른 사용자 권한변경",
              ul_editorName: loginUser.user_name,
              ul_editorId: loginUser.user_id,
              ul_editorRank: loginUser.user_rank,
              hospital: { connect: { hsp_id: rank.hsp_id } },
            },
          });
        });

        return true;
      } catch (e) {
        console.log("직책 권한 수정 실패. updateRankPermission", e);
        throw new Error("직책 권한 수정에 실패하였습니다.");
      }
    },
  },
};

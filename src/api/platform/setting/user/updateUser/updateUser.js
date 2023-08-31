import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_id, name, birthday, cellphone, email, org, rank, job } = args;
      try {
        const updateUser = await prisma.user.findUnique({ where: { user_id: user_id } });

        await prisma.user.update({
          where: { user_id },
          data: {
            user_name: name ? name : updateUser.user_name,
            user_birthday: birthday ? birthday : updateUser.user_birthday,
            user_cellphone: cellphone ? cellphone : updateUser.user_cellphone,
            user_email: email ? email : updateUser.user_email,
            user_org: org ? org : updateUser.user_org,
            user_rank: rank ? rank : updateUser.user_rank,
            user_job: job ? job : updateUser.user_job,
          },
        });

        if (rank !== updateUser.user_rank) {
          const findRank = await prisma.rank.findMany({
            where: { AND: [{ hsp_id }, { rank_name: rank }] },
          });

          const rankPermission = await prisma.rankPermission.findUnique({
            where: { rank_id: findRank[0].rank_id },
          });

          await prisma.userPermission.update({
            where: { user_id },
            data: {
              up_reservation: rankPermission.rp_reservation,
              up_schedule: rankPermission.rp_schedule,
              up_patient: rankPermission.rp_patient,
              up_did: rankPermission.rp_did,
              up_insurance: rankPermission.rp_insurance,
              up_cs: rankPermission.rp_cs,
              up_setting: rankPermission.rp_setting,
            },
          });
        }

        return true;
      } catch (e) {
        console.log("사용자 정보 수정 실패. updateUser", e);
        throw new Error("사용자 정보 수정에 실패하였습니다.");
      }
    },
  },
};

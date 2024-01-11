import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { rank_name, home, reservation, schedule, patient, did, insurance, cs, setting } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const findRank = await prisma.rank.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { rank_name }] },
        });

        if (findRank.length) throw 1;

        const rank = await prisma.rank.create({
          data: {
            rank_creatorId: loginUser.user_id,
            rank_creatorName: loginUser.user_name,
            rank_creatorRank: loginUser.user_rank,
            rank_name,
            hospital: { connect: { hsp_id: loginUser.hsp_id } },
          },
        });

        // 권한 자동생성
        await prisma.rankPermission.create({
          data: {
            rp_creatorId: loginUser.user_id,
            rp_creatorName: loginUser.user_name,
            rp_creatorRank: loginUser.user_rank,
            rp_home: home,
            rp_reservation: reservation,
            rp_schedule: schedule,
            rp_patient: patient,
            rp_did: did,
            rp_insurance: insurance,
            rp_cs: cs,
            rp_setting: setting,
            rank: { connect: { rank_id: rank.rank_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("직책 등록 실패. createRank", e);
        if (e === 1) throw new Error("err_01"); // 이미 등록된 이름입니다.
        throw new Error("직책 등록에 실패하였습니다.");
      }
    },
  },
};

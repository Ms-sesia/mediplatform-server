import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeUserInfoDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const checkUser = await prisma.user.findMany({
          where: { AND: [{ user_id: user.user_id }, { user_isDelete: false }] },
        });
        if (!checkUser.length) throw 1;

        const loginUser = await prisma.user.findUnique({
          where: { user_id: user.user_id },
        });

        const rank = await prisma.rank.findFirst({
          where: { AND: [{ rank_name: loginUser.user_rank }, { hsp_id: loginUser.hsp_id }] },
        });
        const rankPermission = await prisma.rankPermission.findUnique({
          where: { rank_id: rank.rank_id },
          select: {
            rp_home: true,
            rp_reservation: true,
            rp_schedule: true,
            rp_patient: true,
            rp_did: true,
            rp_insurance: true,
            rp_cs: true,
            rp_setting: true,
          },
        });

        loginUser.user_birthday = loginUser.user_birthday.split("T")[0];

        loginUser.user_rankPermission = {
          home: rankPermission.rp_home,
          reservation: rankPermission.rp_reservation,
          schedule: rankPermission.rp_schedule,
          patient: rankPermission.rp_patient,
          did: rankPermission.rp_did,
          insurance: rankPermission.rp_insurance,
          cs: rankPermission.rp_cs,
          setting: rankPermission.rp_setting,
        };

        return loginUser;
      } catch (e) {
        console.log("사용자 기본 정보 조회 실패. seeUserInfoDetail ==>\n", e);
        if (e === 1) throw new Error("존재하지 않거나 삭제된 사용자입니다.");
        throw new Error("사용자 기본 정보 조회에 실패하였습니다.");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeRank: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const searchRankList = await prisma.rank.findMany({
          where: {
            AND: [{ rank_isDelete: false }, { hsp_id: user.hospital.hsp_id }, { NOT: { rank_name: "대표원장" } }],
          },
          orderBy: { rank_name: "asc" },
          select: {
            rank_id: true,
            rank_name: true,
            rankPermission: {
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
            },
          },
        });

        if (!searchRankList.length)
          return {
            totalLength: 0,
            rankList: [],
          };

        const rankList = searchRankList.map((rank) => {
          rank.rank_permission = {
            home: rank.rankPermission.rp_home,
            reservation: rank.rankPermission.rp_reservation,
            schedule: rank.rankPermission.rp_schedule,
            patient: rank.rankPermission.rp_patient,
            did: rank.rankPermission.rp_did,
            insurance: rank.rankPermission.rp_insurance,
            cs: rank.rankPermission.rp_cs,
            setting: rank.rankPermission.rp_setting,
          };

          return rank;
        });

        return {
          totalLength: searchRankList.length ? searchRankList.length : 0,
          rankList: searchRankList.length ? rankList : [],
        };
      } catch (e) {
        console.log("직책 조회 실패. seeRank ==>\n", e);
        throw new Error("직책 조회에 실패하였습니다.");
      }
    },
  },
};

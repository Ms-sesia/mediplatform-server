import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      const { term } = args;
      try {
        // // 병원 등록
        // const hospital = await prisma.hospital.create({
        //   data: {
        //     hsp_name: "환자목록테스트병원",
        //     hsp_chief: "플랫큐브",
        //     hsp_email: "zoenea@naver.com",
        //     hsp_country: "",
        //     alimSet: {
        //       create: {},
        //     },
        //   },
        // });

        // const rankName = "대표원장";

        // const isRank = await prisma.rank.findMany({
        //   where: { AND: [{ hsp_id: hospital.hsp_id }, { rank_name: rankName }] },
        // });

        // // 생성되어있는 직책(권한)이 없을 경우
        // if (!isRank.length) {
        //   const rank = await prisma.rank.create({
        //     data: {
        //       rank_name: rankName,
        //       hospital: { connect: { hsp_id: hospital.hsp_id } },
        //     },
        //   });

        //   await prisma.rankPermission.create({
        //     data: {
        //       rp_reservation: true,
        //       rp_schedule: true,
        //       rp_patient: true,
        //       rp_did: true,
        //       rp_insurance: true,
        //       rp_cs: true,
        //       rp_setting: true,
        //       rank: { connect: { rank_id: rank.rank_id } },
        //     },
        //   });
        // }

        // const hashedInfo = await hashPassword("12341234");

        // await prisma.user.create({
        //   data: {
        //     user_name: "이영광",
        //     user_email: "zoenea@naver.com",
        //     user_salt: hashedInfo.salt,
        //     user_rank: rankName,
        //     user_password: hashedInfo.password,
        //     hospital: { connect: { hsp_id: hospital.hsp_id } },
        //     userPermission: {
        //       create: {
        //         up_home: true,
        //         up_reservation: true,
        //         up_schedule: true,
        //         up_patient: true,
        //         up_did: true,
        //         up_insurance: true,
        //         up_cs: true,
        //         up_setting: true,
        //       },
        //     },
        //   },
        // });
        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};

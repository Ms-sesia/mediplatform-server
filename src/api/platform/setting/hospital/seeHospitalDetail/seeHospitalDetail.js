import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hospital = await prisma.hospital.findUnique({
          where: { hsp_id: user.hospital.hsp_id },
          select: {
            hsp_id: true,
            hsp_name: true,
            hsp_chief: true,
            hsp_hospitalNumber: true,
            hsp_businessNumber: true,
            hsp_img: true,
            hsp_email: true,
            hsp_address: true,
            hsp_detailAddress: true,
            hsp_medicalDepartment: true,
            hsp_kakaoChannelId: true,
            hsp_kakaoChannelUrl: true,
            hsp_messageTrId: true,
            hsp_messageSendNum: true,
          },
        });

        if (!hospital) throw 1;

        return hospital;
      } catch (e) {
        console.log("병원정보 상세조회 실패. seeHospitalDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalDetailAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsp_id } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id } });

        const hspUsers = await prisma.user.findMany({
          where: {
            AND: [{ user_isDelete: false }, { hsp_id }],
          },
          select: {
            user_name: true,
            user_rank: true,
            user_email: true,
            user_cellphone: true,
          },
        });

        const hspDetailInfo = {
          hsp_id: hospital.hsp_id,
          hsp_name: hospital.hsp_name,
          hsp_useStartDate: new Date(hospital.hsp_useStartDate).toISOString(),
          hsp_useEndDate: new Date(hospital.hsp_useEndDate).toISOString(),
          hsp_chief: hospital.hsp_chief,
          hsp_createdAt: new Date(hospital.hsp_createdAt).toISOString(),
          hsp_hospitalNumber: hospital.hsp_hospitalNumber,
          hsp_businessNumber: hospital.hsp_businessNumber,
          hsp_email: hospital.hsp_email,
          hsp_adminCreatorName: hospital.hsp_adminCreatorName,
          hsp_adminCreatorRank: hospital.hsp_adminCreatorRank,
          totalUserNumber: hspUsers.length ? hspUsers.length : 0,
          hospitalUserList: hspUsers,
        };

        return hspDetailInfo;
      } catch (e) {
        console.log("병원 상세정보 조회 실패. seeHospitalDetailAdmin", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

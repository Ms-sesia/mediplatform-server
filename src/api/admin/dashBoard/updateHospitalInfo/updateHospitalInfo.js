import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospitalInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hsp_id, name, useStartDate, useEndDate, chief, country, businessNumber, hospitalNumber } = args;
      try {
        if (user.userType !== "admin") throw 0;

        const startDate = new Date(useStartDate);
        const endDate = new Date(useEndDate);
        const contractStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const contractEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

        console.log("useStartDate:", startDate);
        console.log("useEndDate:", endDate);
        // 병원 정보 수정
        const hospital = await prisma.hospital.update({
          where: { hsp_id },
          data: {
            hsp_name: name,
            hsp_useStartDate: contractStartDate,
            hsp_useEndDate: contractEndDate,
            hsp_chief: chief,
            hsp_country: country,
            hsp_businessNumber: businessNumber,
            hsp_hospitalNumber: hospitalNumber,
          },
        });

        return true;
      } catch (e) {
        console.log("병원정보 수정 실패. updateHospitalInfo", e);
        if (e === 0) throw new Error("err_01"); // 플랫폼 관리자만 사용할 수 있는 기능입니다.
        throw new Error("err_00"); // 병원정보 수정에 실패하였습니다.
      }
    },
  },
};

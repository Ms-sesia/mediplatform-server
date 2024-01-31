import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, orderBy, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const today = new Date();

        const lastMonthStartdate = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        const lastMonthEnddate = new Date(today.getFullYear(), today.getMonth(), 0);
        const thisMonthStartdate = new Date(today.getFullYear(), today.getMonth(), 0);
        const thisMonthEnddate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const thisMonthSales = await prisma.hospitalPayment.aggregate({
          where: { hp_paymentDate: { gte: lastMonthStartdate, lte: lastMonthEnddate } },
          _sum: { hp_paymentAmount: true },
        });

        const cumulativeSales = await prisma.hospitalPayment.aggregate({
          _sum: { hp_paymentAmount: true },
        });

        const hospitalNumber = await prisma.hospital.count();
        const userNumber = await prisma.user.count();

        const thisMonthHospitalNumber = await prisma.hospital.count({
          where: { hsp_createdAt: { gte: thisMonthStartdate, lte: thisMonthEnddate } },
        });
        const lastMonthHospitalNumber = await prisma.hospital.count({
          where: { hsp_createdAt: { gte: lastMonthStartdate, lte: lastMonthEnddate } },
        });

        const ratio = lastMonthHospitalNumber
          ? Math.abs(100 - (thisMonthHospitalNumber / lastMonthHospitalNumber) * 100).toFixed(1)
          : -1;

        const totalHospital = await prisma.hospital.findMany({
          where: {
            AND: [
              { hsp_isDelete: false },
              { OR: [{ hsp_name: { contains: searchTerm } }, { hsp_hospitalNumber: { contains: searchTerm } }] }, // 병원명, 요양기관번호 검색
            ],
          },
          orderBy: { hsp_createdAt: orderBy === "desc" ? "desc" : "asc" },
        });

        if (!totalHospital.length) {
          return {
            thisMonthSales: thisMonthSales._sum.hp_paymentAmount,
            cumulativeSales: cumulativeSales._sum.hp_paymentAmount,
            hospitalNumber,
            userNumber,
            thisMonthHospitalNumber,
            lastMonthHospitalNumber,
            lastMonthRatio: ratio,
            totalLength: 0,
            hospitalList: [],
          };
        }

        const cursorId = totalHospital[cursor].hsp_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { hsp_id: cursorId } };

        const hospitalList = await prisma.hospital.findMany({
          where: {
            AND: [
              { hsp_isDelete: false },
              { OR: [{ hsp_name: { contains: searchTerm } }, { hsp_hospitalNumber: { contains: searchTerm } }] }, // 병원명, 요양기관번호 검색
            ],
          },
          ...cursorOpt,
          orderBy: { hsp_createdAt: orderBy === "desc" ? "desc" : "asc" },
        });

        const hospitalInfos = hospitalList.map((hsp) => {
          hsp.hsp_createdAt = new Date(hsp.hsp_createdAt).toISOString();
          hsp.hsp_useEndDate = new Date(hsp.hsp_useEndDate).toISOString();

          return hsp;
        });

        return {
          thisMonthSales: thisMonthSales._sum.hp_paymentAmount ? thisMonthSales._sum.hp_paymentAmount : 0,
          cumulativeSales: cumulativeSales._sum.hp_paymentAmount,
          hospitalNumber,
          userNumber,
          thisMonthHospitalNumber,
          lastMonthHospitalNumber,
          lastMonthRatio: ratio,
          totalLength: totalHospital.length ? totalHospital.length : 0,
          hospitalList: hospitalList.length ? hospitalInfos : [],
        };
      } catch (e) {
        console.log("병원 목록 조회 실패. seeHospitalList", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

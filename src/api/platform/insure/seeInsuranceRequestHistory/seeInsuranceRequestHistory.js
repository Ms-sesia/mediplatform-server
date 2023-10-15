import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeInsuranceRequestHistory: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, company, orderBy, take, cursor } = args;
      try {
        const totalIh = await prisma.insuranceHistory.findMany({
          where: { AND: [{ ih_tobePatno: { contains: searchTerm } }, { ih_companyName: { contains: company } }] },
          orderBy: { ih_createdAt: orderBy },
        });

        if (!totalIh.length)
          return {
            totalLength: 0,
            insuranceList: [],
          };

        const cursorId = totalIh[cursor].ih_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { ih_id: cursorId } };

        const ih = await prisma.insuranceHistory.findMany({
          where: { AND: [{ ih_tobePatno: { contains: searchTerm } }, { ih_companyName: { contains: company } }] },
          ...cursorOpt,
          orderBy: { ih_createdAt: orderBy },
        });

        const ihList = ih.map(async (ihData) => {
          const recHistory = await prisma.ihText.findFirst({
            where: { ih_id: ihData.ih_id },
            orderBy: { iht_createdAt: "desc" },
          });
          return {
            ih_id: ihData.ih_id,
            createdAt: ihData.ih_createdAt,
            companyName: ihData.ih_companyName,
            reqNumber: ihData.ih_reqNumber,
            tobePatno: ihData.ih_tobePatno,
            tobeClaimDate: ihData.ih_tobeClaimDate,
            status: ihData.ih_status,
            recentlyHistory: recHistory.iht_text,
          };
        });

        return {
          totalLength: totalIh.length ? totalIh.length : 0,
          insuranceList: ih.length ? ihList : [],
        };
      } catch (e) {
        console.log("청구기록 조회(검색-요청번호) 실패. seeHPMain ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

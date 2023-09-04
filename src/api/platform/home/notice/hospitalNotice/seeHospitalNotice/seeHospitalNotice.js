import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, filter, take, cursor } = args;
      try {
        const start = new Date(year, 0, 1, 9);
        const end = new Date(year + 1, 0, 1, 9);

        const totalHospitalNotice = await prisma.hospitalNotice.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { hn_createdAt: { gte: start, lte: end } }],
          },
          orderBy: { hn_createdAt: filter },
        });

        if (!totalHospitalNotice.length)
          return {
            totalLength: 0,
            hospitalNoticeList: [],
          };

        const cursorId = totalHospitalNotice[cursor].hn_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { hn_id: cursorId } };

        const hospitalNotice = await prisma.hospitalNotice.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { hn_createdAt: { gte: start, lte: end } }, { hn_isDelete: false }],
          },
          ...cursorOpt,
          include: {
            hnAttached: {
              select: {
                hna_id: true,
                hna_url: true,
                han_fileType: true,
                han_fileSize: true,
              },
            },
            hnComment: {
              where: { hnc_isDelete: false },
              select: {
                hnc_id: true,
                hnc_createdAt: true,
                hnc_creatorName: true,
                hnc_creatorRank: true,
                hnc_creatorId: true,
                hnc_text: true,
              },
            },
          },
          orderBy: { hn_createdAt: filter },
        });

        return {
          totalLength: totalHospitalNotice.length ? totalHospitalNotice.length : 0,
          hospitalNoticeList: hospitalNotice.length ? hospitalNotice : [],
        };
      } catch (e) {
        console.log("사내 공지사항 조회 실패. seeHospitalNotice ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

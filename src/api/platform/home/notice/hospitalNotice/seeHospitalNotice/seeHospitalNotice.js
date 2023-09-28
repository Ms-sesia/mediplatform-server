import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, filter, take, cursor } = args;
      try {
        let start, end;
        if (year !== 0) {
          start = new Date(year, 0, 1, 9);
          end = new Date(year + 1, 0, 1, 9);
        }

        const totalHospitalNotice = await prisma.hospitalNotice.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { hn_createdAt: year !== 0 ? { gte: start, lte: end } : undefined },
            ],
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
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { hn_createdAt: year !== 0 ? { gte: start, lte: end } : undefined },
              { hn_isDelete: false },
            ],
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

        const hospitalNoticeList = hospitalNotice.map(async (hn) => {
          hn.hn_createdAt = new Date(hn.hn_createdAt).toISOString();
          const creator = await prisma.user.findUnique({ where: { user_id: hn.hn_creatorId } });
          hn.hn_creatorImg = creator.user_img;

          hn.hnComment = hn.hnComment.map(async (hnc) => {
            hnc.hnc_createdAt = new Date(hnc.hnc_createdAt).toISOString();

            const hncCreator = await prisma.user.findUnique({ where: { user_id: hnc.hnc_creatorId } });
            hnc.hnc_creatorImg = hncCreator.user_img;

            return hnc;
          });

          return hn;
        });

        return {
          totalLength: totalHospitalNotice.length ? totalHospitalNotice.length : 0,
          hospitalNoticeList: hospitalNotice.length ? hospitalNoticeList : [],
        };
      } catch (e) {
        console.log("사내 공지사항 조회 실패. seeHospitalNotice ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

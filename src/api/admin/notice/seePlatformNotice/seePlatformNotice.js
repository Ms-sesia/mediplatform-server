import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seePlatformNotice: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      const { user } = request;
      const { searchTerm, filter, orderBy, year, take, cursor } = args;
      try {
        // if (user.userType !== "admin") throw 1;

        // const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        let start, end;
        if (year !== 0) {
          start = new Date(year, 0, 1, 9);
          end = new Date(year + 1, 0, 1, 9);
        }

        if (user?.userType === "user") {
          const createSearchHistory = await searchHistory(searchTerm, user.user_id);
          if (!createSearchHistory.status) throw createSearchHistory.error;
        }

        const totalPlatformNotice = await prisma.platformNotice.findMany({
          where: {
            AND: [
              { pn_title: { contains: searchTerm } },
              { pn_createdAt: year !== 0 ? { gte: start, lte: end } : undefined },
              { pn_type: filter === "total" ? undefined : filter },
              { pn_isDelete: false },
            ],
          },
          orderBy: orderBy ? { pn_createdAt: orderBy } : { pn_createdAt: "desc" },
        });

        if (!totalPlatformNotice.length)
          return {
            totalLength: 0,
            platformNotice: [],
          };

        const cursorId = totalPlatformNotice[cursor].pn_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { pn_id: cursorId } };

        const platformNoticeList = await prisma.platformNotice.findMany({
          where: {
            AND: [
              { pn_title: { contains: searchTerm } },
              { pn_createdAt: year !== 0 ? { gte: start, lte: end } : undefined },
              { pn_type: filter === "total" ? undefined : filter },
              { pn_isDelete: false },
            ],
          },
          include: {
            pnComment: {
              where: { pnc_isDelete: false },
              select: {
                pnc_id: true,
                pnc_text: true,
                pnc_createdAt: true,
                pnc_updatedAt: true,
                pnc_creatorId: true,
                pnc_creatorName: true,
                pnc_creatorRank: true,
                pnc_admin: true,
              },
            },
            pnAttached: {
              select: {
                pna_id: true,
                pna_url: true,
                pna_fileType: true,
                pna_fileSize: true,
              },
            },
          },
          ...cursorOpt,
          orderBy: orderBy ? { pn_createdAt: orderBy } : { pn_createdAt: "desc" },
        });

        const convNotice = platformNoticeList.map(async (pn) => {
          pn.pn_createdAt = new Date(pn.pn_createdAt).toISOString();
          pn.pn_updatedAt = new Date(pn.pn_updatedAt).toISOString();

          pn.pnComment = pn.pnComment.map(async (pnc) => {
            pnc.pnc_createdAt = new Date(pnc.pnc_createdAt).toISOString();
            pnc.pnc_updatedAt = new Date(pnc.pnc_updatedAt).toISOString();

            pnc.pnc_creatorImg = pnc.pnc_admin
              ? ""
              : (await prisma.user.findUnique({ where: { user_id: pnc.pnc_creatorId } })).user_img;

            return pnc;
          });

          return pn;
        });

        return {
          totalLength: totalPlatformNotice.length ? totalPlatformNotice.length : 0,
          platformNotice: platformNoticeList.length ? convNotice : [],
        };
      } catch (e) {
        console.log("관리자 목록 조회 실패. seePlatformNotice ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

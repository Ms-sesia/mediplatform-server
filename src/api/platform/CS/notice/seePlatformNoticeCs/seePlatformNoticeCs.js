import { PrismaClient } from "@prisma/client";
import searchHistory from "../../../../../libs/searchHistory";

const prisma = new PrismaClient();

export default {
  Query: {
    seePlatformNoticeCs: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { filter, searchTerm, orderby } = args;
      try {
        const createSearchHistory = await searchHistory(searchTerm, user.user_id);
        if (!createSearchHistory.status) throw createSearchHistory.error;

        const totalPlatformNotice = await prisma.platformNotice.findMany({
          where: {
            AND: [{ pn_isDelete: false }, { pn_type: filter }, { pn_title: { contains: searchTerm } }],
          },
          include: {
            pnAttached: {
              select: {
                pna_id: true,
                pna_url: true,
                pna_fileType: true,
                pna_fileSize: true,
              },
            },
            pnComment: {
              where: { pnc_isDelete: false },
              select: {
                pnc_id: true,
                pnc_text: true,
                pnc_createdAt: true,
                pnc_updatedAt: true,
                pnc_creatorName: true,
                pnc_creatorRank: true,
                pnc_creatorId: true,
                pnc_admin: true,
              },
            },
          },
          orderBy: { pn_createdAt: orderby },
        });

        // let cmtUser;
        const pnList = totalPlatformNotice.map((pn) => {
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
          platformNoticeList: totalPlatformNotice.length ? pnList : [],
        };
      } catch (e) {
        console.log("플랫폼 공지(긴급/업데이트)조회 실패. seePlatformNoticeCs ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

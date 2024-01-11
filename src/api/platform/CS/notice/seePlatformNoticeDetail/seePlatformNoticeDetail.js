import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seePlatformNoticeDetail: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { pn_id } = args;
      try {
        // const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const platformNotice = await prisma.platformNotice.findUnique({
          where: { pn_id },
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
              },
            },
          },
        });

        platformNotice.pn_createdAt = new Date(platformNotice.pn_createdAt).toISOString();
        platformNotice.pn_updatedAt = new Date(platformNotice.pn_updatedAt).toISOString();

        platformNotice.pnComment = platformNotice.pnComment.map(async (pnc) => {
          const commentCreator = await prisma.user.findUnique({ where: { user_id: pnc.pnc_creatorId } });

          pnc.pnc_createdAt = new Date(pnc.pnc_createdAt).toISOString();
          pnc.pnc_updatedAt = new Date(pnc.pnc_updatedAt).toISOString();
          pnc.pnc_creatorImg = commentCreator.user_img;

          return pnc;
        });

        return platformNotice;
      } catch (e) {
        console.log("플랫폼 공지(긴급/업데이트) 상세보기 실패. seePlatformNoticeDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

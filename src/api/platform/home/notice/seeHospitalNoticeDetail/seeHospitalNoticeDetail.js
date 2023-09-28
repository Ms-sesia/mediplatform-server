import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeHospitalNoticeDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { hn_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const hospitalNotice = await prisma.hospitalNotice.findUnique({
          where: { hn_id },
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
                hnc_text: true,
                hnc_createdAt: true,
                hnc_updatedAt: true,
                hnc_creatorName: true,
                hnc_creatorRank: true,
                hnc_creatorId: true,
              },
            },
          },
        });

        const hnCreator = await prisma.user.findUnique({ where: { user_id: hospitalNotice.hn_creatorId } });

        hospitalNotice.hn_createdAt = new Date(hospitalNotice.hn_createdAt).toISOString();
        hospitalNotice.hn_updatedAt = new Date(hospitalNotice.hn_updatedAt).toISOString();
        hospitalNotice.hn_creatorImg = hnCreator.user_img;

        hospitalNotice.hnComment = hospitalNotice.hnComment.map(async (hnc) => {
          hnc.hnc_createdAt = new Date(hnc.hnc_createdAt).toISOString();
          hnc.hnc_updatedAt = new Date(hnc.hnc_updatedAt).toISOString();
          const hncCreator = await prisma.user.findUnique({ where: { user_id: hnc.hnc_creatorId } });
          hnc.hnc_creatorImg = hncCreator.user_img;
          return hnc;
        });

        return hospitalNotice;
      } catch (e) {
        console.log("사내 공지 상세보기 실패. seeHospitalNoticeDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

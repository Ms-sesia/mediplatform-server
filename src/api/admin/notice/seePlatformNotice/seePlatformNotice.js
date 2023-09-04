import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seePlatformNotice: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchTerm, filter, take, cursor } = args;
      try {
        // if (user.userType !== "admin") throw 1;

        // const loginAdmin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        const totalPlatformNotice = await prisma.platformNotice.findMany({
          where: {
            AND: [
              { pn_title: { contains: searchTerm } },
              { pn_text: { contains: searchTerm } },
              { pn_type: filter === "total" ? undefined : filter },
              { pn_isDelete: false },
            ],
          },
          orderBy: { pn_createdAt: "desc" },
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
              { pn_text: { contains: searchTerm } },
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
          orderBy: { pn_createdAt: "desc" },
        });

        return {
          totalLength: totalPlatformNotice.length ? totalPlatformNotice.length : 0,
          platformNotice: platformNoticeList.length ? platformNoticeList : [],
        };
      } catch (e) {
        console.log("관리자 목록 조회 실패. seePlatformNotice ==>\n", e);
        // if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

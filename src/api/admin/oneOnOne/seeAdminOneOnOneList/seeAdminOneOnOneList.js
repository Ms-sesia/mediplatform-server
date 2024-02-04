import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeAdminOneOnOneList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { publicPrivate, answerStatus, orderBy, take, cursor } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const totalOneList = await prisma.oneOnOne.findMany({
          where: {
            AND: [
              { oneq_publicPrivate: !publicPrivate ? false : true },
              { oneq_status: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false },
              { oneq_isDelete: false },
            ],
          },
          orderBy: { oneq_createdAt: orderBy },
        });

        if (!totalOneList.length)
          return {
            totalLength: 0,
            inquireList: [],
          };

        const cursorId = totalOneList[cursor].oneq_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { oneq_id: cursorId } };

        const oneList = await prisma.oneOnOne.findMany({
          where: {
            AND: [
              { oneq_publicPrivate: !publicPrivate ? false : true },
              { oneq_status: answerStatus === "total" ? undefined : answerStatus === "ans" ? true : false },
              { oneq_isDelete: false },
            ],
          },
          ...cursorOpt,
          orderBy: { oneq_createdAt: orderBy },
        });

        const inquireList = oneList.map(async (one) => {
          const hsp = await prisma.hospital.findUnique({ where: { hsp_id: one.hsp_id }, select: { hsp_name: true } });
          const creator = await prisma.user.findUnique({
            where: { user_id: one.oneq_creatorId },
            select: { user_name: true, user_rank: true, user_email: true },
          });

          return {
            oneq_id: one.oneq_id,
            title: one.oneq_title,
            text: one.oneq_text,
            hospitalName: hsp.hsp_name,
            creatorName: creator.user_name,
            creatorRank: creator.user_rank,
            creatorEmail: creator.user_email,
            createdAt: new Date(one.oneq_createdAt).toISOString(),
            answerStatus: one.oneq_status,
          };
        });

        return {
          totalLength: totalOneList.length ? totalOneList.length : 0,
          inquireList: inquireList.length ? inquireList : [],
        };
      } catch (e) {
        console.log("예약 환자 통계 조회 실패. seeAdminOneOnOneList ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeOneOnOneList: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { answerStatus, take, cursor, orderBy } = args;
      try {
        const hspInquire = await prisma.oneOnOne.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { oneq_isDelete: false },
              { oneq_status: answerStatus === "total" ? undefined : answerStatus === "answered" ? true : false },
            ],
          },
          orderBy: { oneq_createdAt: orderBy },
        });

        if (!hspInquire.length)
          return {
            totalLength: 0,
            inquireList: [],
          };

        const cursorId = hspInquire[cursor].oneq_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { oneq_id: cursorId } };

        const inquire = await prisma.oneOnOne.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { oneq_isDelete: false },
              { oneq_status: answerStatus === "total" ? undefined : answerStatus === "answered" ? true : false },
            ],
          },
          select: {
            oneq_id: true,
            oneq_createdAt: true,
            oneq_creatorName: true,
            oneq_creatorRank: true,
            oneq_creatorId: true,
            oneq_title: true,
            oneq_status: true,
          },
          ...cursorOpt,
          orderBy: { oneq_createdAt: orderBy },
        });

        const inquireList = inquire.map(async (iq) => {
          const creator = await prisma.user.findUnique({ where: { user_id: iq.oneq_creatorId } });
          iq.oneq_createdAt = new Date(iq.oneq_createdAt).toISOString();
          iq.oneq_creatorImg = creator.user_img;
          return iq;
        });

        return {
          totalLength: hspInquire.length ? hspInquire.length : 0,
          inquireList: inquireList.length ? inquireList : [],
        };
      } catch (e) {
        console.log("일대일 문의 조회 실패. seeOneOnOneList ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

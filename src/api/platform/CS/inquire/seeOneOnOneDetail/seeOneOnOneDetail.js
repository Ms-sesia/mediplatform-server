import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeOneOnOneDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id } = args;
      try {
        const inquire = await prisma.oneOnOne.findUnique({
          where: { oneq_id },
          include: {
            oneOnOneAttached: {
              select: {
                oneAt_id: true,
                oneAt_url: true,
                oneAt_fileType: true,
                oneAt_fileSize: true,
              },
            },
            oneOnOneAnswer: {
              where: { oneAn_isDelete: false },
              select: {
                oneAn_id: true,
                oneAn_createdAt: true,
                oneAn_adminAble: true,
                oneAn_creatorName: true,
                oneAn_creatorRank: true,
                oneAn_creatorId: true,
                oneAn_adminCreatorId: true,
                oneAn_adminCreatorName: true,
                oneAn_adminCreatorRank: true,
                oneAn_answer: true,
              },
            },
          },
        });

        inquire.oneq_createdAt = new Date(inquire.oneq_createdAt).toISOString();

        inquire.oneOnOneAnswer.map((oneA) => {
          oneA.oneAn_createdAt = new Date(oneA.oneAn_createdAt).toISOString();
          return oneA;
        });

        if (!inquire) throw 1;

        return inquire;
      } catch (e) {
        console.log("일대일 문의 상세 조회 실패. seeOneOnOneDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

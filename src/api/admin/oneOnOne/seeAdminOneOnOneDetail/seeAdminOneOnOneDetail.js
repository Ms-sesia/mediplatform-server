import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeAdminOneOnOneDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { oneq_id } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const inquire = await prisma.oneOnOne.findUnique({
          where: { oneq_id },
          include: {
            hospital: {
              select: {
                hsp_name: true,
                hsp_chief: true,
                hsp_hospitalNumber: true,
                hsp_businessNumber: true,
                hsp_email: true,
              },
            },
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

        const creator = await prisma.user.findUnique({
          where: { user_id: inquire.oneq_creatorId },
          select: { user_email: true },
        });

        inquire.oneq_createdAt = new Date(inquire.oneq_createdAt).toISOString();

        inquire.oneOnOneAnswer.map((oneA) => {
          oneA.oneAn_createdAt = new Date(oneA.oneAn_createdAt).toISOString();
          return oneA;
        });

        if (!inquire) throw 2;

        const inquireInfo = {
          inquireInfo: {
            hospitalName: inquire.hospital.hsp_name,
            ceoName: inquire.hospital.hsp_chief,
            hospitalNumber: inquire.hospital.hsp_hospitalNumber,
            businessNumber: inquire.hospital.hsp_businessNumber,
            ceoEmail: inquire.hospital.hsp_email,
            creatorName: inquire.oneq_creatorName,
            creatorRank: inquire.oneq_creatorRank,
            creatorEmail: creator.user_email,
            createdAt: inquire.oneq_createdAt,
            status: inquire.oneq_status,
          },
          oneOnOne: {
            oneq_id: inquire.oneq_id,
            title: inquire.oneq_title,
            text: inquire.oneq_text,
            oneOnOneAttached: inquire.oneOnOneAttached,
            oneOnOneAnswer: inquire.oneOnOneAnswer,
          },
        };

        return inquireInfo;
      } catch (e) {
        console.log("관리자 일대일 문의 상세 조회 실패. seeAdminOneOnOneDetail ==>\n", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02");
        throw new Error("err_00");
      }
    },
  },
};

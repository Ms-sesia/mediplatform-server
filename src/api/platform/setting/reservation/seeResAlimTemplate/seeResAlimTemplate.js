import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeResAlimTemplate: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const totalTemplate = await prisma.resAlimTemplate.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { rat_isDelete: false }],
          },
          orderBy: { rat_createdAt: "desc" },
        });

        if (!totalTemplate.length)
          return {
            totalLength: 0,
            templateList: [],
          };

        return {
          totalLength: totalTemplate.length ? totalTemplate.length : 0,
          templateList: totalTemplate.length ? totalTemplate : [],
        };
      } catch (e) {
        console.log("알림 발송 목록조회 실패. seeResAlimTemplate ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

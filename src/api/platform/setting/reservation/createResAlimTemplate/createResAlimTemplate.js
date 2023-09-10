import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createResAlimTemplate: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { title, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.resAlimTemplate.create({
          data: {
            rat_title: title,
            rat_text: text,
            rat_createdAt: today9,
            rat_updatedAt: today9,
            rat_creatorId: loginUser.user_id,
            rat_creatorName: loginUser.user_name,
            rat_creatorRank: loginUser.user_rank,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("알림 템플릿 등록 실패. createResAlimTemplate", e);
        throw new Error("알림 템플릿 등록에 실패하였습니다.");
      }
    },
  },
};

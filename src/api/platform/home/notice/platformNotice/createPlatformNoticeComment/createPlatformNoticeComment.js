import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPlatformNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.pnComment.create({
          data: {
            pnc_text: text,
            pnc_createdAt: today9,
            pnc_updatedAt: today9,
            pnc_creatorId: loginUser.user_id,
            pnc_creatorName: loginUser.user_name,
            pnc_creatorRank: loginUser.user_rank,
            platformNotice: { connect: { pn_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 댓글 작성 실패. createPlatformNoticeComment", e);
        throw new Error("err_00");
      }
    },
  },
};

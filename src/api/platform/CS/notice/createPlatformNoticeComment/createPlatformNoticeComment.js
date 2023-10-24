import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPlatformNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        // const platformNotice = await prisma.platformNotice.findUnique({ where: { pn_id } });

        await prisma.pnComment.create({
          data: {
            pnc_creatorId: loginUser.user_id,
            pnc_creatorName: loginUser.user_name,
            pnc_creatorRank: loginUser.user_rank,
            pnc_text: text,
            platformNotice: { connect: { pn_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 댓글 등록 실패. createPlatformNoticeComment", e);
        throw new Error("err_00");
      }
    },
  },
};

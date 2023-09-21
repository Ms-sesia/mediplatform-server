import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePlatformNotcieComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pnc_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const pnc = await prisma.pnComment.findUnique({ where: { pnc_id } });
        if (pnc.pnc_creatorId !== user.user_id) throw 1;

        await prisma.pnComment.update({
          where: { pnc_id },
          data: {
            pnc_updatedAt: today9,
            pnc_editorId: loginUser.user_id,
            pnc_editorName: loginUser.user_name,
            pnc_editorRank: loginUser.user_rank,
            pnc_text: text,
          },
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 댓글 수정 실패. updatePlatformNotcieComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

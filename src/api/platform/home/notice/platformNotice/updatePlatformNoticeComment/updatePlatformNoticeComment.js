import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updatePlatformNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pnc_id, text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const platformNoticeComment = await prisma.pnComment.findUnique({ where: { pnc_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        if (loginUser.user_id !== platformNoticeComment.pnc_creatorId && hospital.hsp_email !== loginUser.user_email)
          throw 1;

        await prisma.pnComment.update({
          where: { pnc_id },
          data: {
            pnc_text: text,
            pnc_editorId: loginUser.user_id,
            pnc_editorName: loginUser.user_name,
            pnc_editorRank: loginUser.user_rank,
          },
        });

        return true;
      } catch (e) {
        console.log("사내공지 수정 실패. updatePlatformNoticeComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createPlatformNoticeCommentAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pn_id, text } = args;
      try {
        if (user.userType !== "admin") throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        await prisma.pnComment.create({
          data: {
            pnc_creatorId: admin.admin_id,
            pnc_creatorName: admin.admin_name,
            pnc_creatorRank: admin.admin_rank,
            pnc_text: text,
            pnc_admin: true,
            platformNotice: { connect: { pn_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 댓글 등록_관리자 실패. createPlatformNoticeCommentAdmin", e);
        if (e === 1) throw new Error("err_01"); // 관리자만 이용할 수 있습니다.
        throw new Error("err_00"); // 플랫폼 공지 댓글 등록에 실패하였습니다.
      }
    },
  },
};

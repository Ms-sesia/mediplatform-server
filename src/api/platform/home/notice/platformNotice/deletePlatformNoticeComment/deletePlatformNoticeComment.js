import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deletePlatformNoticeComment: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { pnc_id } = args;
      try {
        const pnc = await prisma.pnComment.findUnique({ where: { pnc_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        let loginUser;
        // 사용자
        if (user.userType !== "admin") {
          loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
          if (loginUser.user_id !== pnc.pnc_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1; // 작성자, 병원계정
          // 관리자는 삭제 가능
        } else {
          loginUser = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        }

        await prisma.pnComment.update({
          where: { pnc_id },
          data: {
            pnc_isDelete: true,
            pnc_deleteDate: new Date(),
            pnc_editorId: user.userType === "admin" ? loginUser.admin_id : loginUser.user_id,
            pnc_editorName: user.userType === "admin" ? loginUser.admin_name : loginUser.user_name,
            pnc_editorRank: user.userType === "admin" ? loginUser.admin_rank : loginUser.user_rank,
          },
        });

        return true;
      } catch (e) {
        console.log("플랫폼 공지 댓글 삭제 실패. deletePlatformNoticeComment", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

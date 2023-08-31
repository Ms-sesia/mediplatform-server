import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUserAlim: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_hnAlim, user_pnAlim, user_resAlim, user_specialAlim } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        await prisma.user.update({
          where: { user_id: loginUser.user_id },
          data: {
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_hnAlim,
            user_pnAlim,
            user_resAlim,
            user_specialAlim,
          },
        });

        await prisma.userUpdateLog.create({
          data: {
            ul_name: loginUser.user_name,
            ul_content: "알림 설정 변경",
            ul_editorId: loginUser.user_id,
            ul_editorName: loginUser.user_name,
            ul_editorRank: loginUser.user_rank,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("알림 설정 변경 실패. updateUserAlim", e);
        if (e === 1) throw new Error("현재 비밀번호가 틀립니다. 다시 입력해주세요.");
        throw new Error("알림 설정 변경에 실패하였습니다.");
      }
    },
  },
};

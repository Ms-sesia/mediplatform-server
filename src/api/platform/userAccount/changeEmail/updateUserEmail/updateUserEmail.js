import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUserEmail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { authCode, email } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const checkAuthCode = await prisma.userEmailAuthCode.findMany({
          where: { user_id: loginUser.user_id },
          orderBy: { ueac_createdAt: "desc" },
        });

        // 인증코드 여부 확인
        if (!checkAuthCode.length) throw 1;

        // 인증코드 확인
        if (checkAuthCode[0].ueac_code !== authCode) throw 2;

        // 이메일 확인
        if (checkAuthCode[0].ueac_email !== email) throw 3;

        await prisma.user.update({
          where: { user_id: loginUser.user_id },
          data: {
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_email: email,
          },
        });

        // 인증 후 인증코드 삭제
        await prisma.userEmailAuthCode.deleteMany({
          where: { user_id: loginUser.user_id },
        });

        await prisma.userUpdateLog.create({
          data: {
            ul_name: loginUser.user_name,
            ul_content: "이메일 변경",
            ul_editorId: loginUser.user_id,
            ul_editorName: loginUser.user_name,
            ul_editorRank: loginUser.user_rank,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("이메일 변경 실패. updateUserEmail", e);
        if (e === 1) throw new Error("발급된 인증번호가 없습니다. 인증번호 발급을 먼저 진행해주세요.");
        if (e === 2) throw new Error("입력한 인증코드가 다릅니다. 다시 확인하고 입력해주세요.");
        if (e === 3) throw new Error("입력한 이메일과 인증 이메일이 다릅니다.");
        throw new Error("이메일 변경에 실패하였습니다.");
      }
    },
  },
};

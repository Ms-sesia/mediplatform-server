import { PrismaClient } from "@prisma/client";
import { hashPassword, makeHashPassword } from "../../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateUserPassword: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { currentPassword, newPassword } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const makeHash = await makeHashPassword(loginUser.user_salt, currentPassword);

        // 변경할 비밀번호 미입력
        if (!newPassword) throw 3;
        // 현재 비밀번호가 틀릴경우
        if (makeHash.password !== loginUser.user_password) throw 1;
        // 현재 비밀번호와 변경하려는 비밀번호가 같을 경우
        if (currentPassword === newPassword) throw 2;

        const hashedInfo = await hashPassword(newPassword);

        await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            user_salt: hashedInfo.salt,
            user_password: hashedInfo.password,
          },
        });

        await prisma.userUpdateLog.create({
          data: {
            ul_name: loginUser.user_name,
            ul_content: "비밀번호 변경",
            ul_editorId: loginUser.user_id,
            ul_editorName: loginUser.user_name,
            ul_editorRank: loginUser.user_rank,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 비밀번호 변경 실패. updateUserPassword", e);
        if (e === 1) throw new Error("현재 비밀번호가 틀립니다. 다시 입력해주세요.");
        if (e === 2) throw new Error("현재 비밀번호와 새 비밀번호가 동일합니다. 다시 입력해주세요.");
        if (e === 3) throw new Error("변경할 비밀번호를 입력해주세요.");
        throw new Error("사용자 비밀번호 변경에 실패하였습니다.");
      }
    },
  },
};

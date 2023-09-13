import { PrismaClient } from "@prisma/client";
import { hashPassword, makeHashPassword } from "../../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateAdminPassword: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { currentPW, newPW, confirmPW } = args;
      try {
        if (user.userType !== "admin") throw 1;

        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });

        // 솔트 확인
        const salt = admin.admin_salt;
        // 솔트를 이용한 pw 해싱
        const makePassword = await makeHashPassword(salt, currentPW);
        if (admin.admin_password !== makePassword.password) throw 2; // 현재 비밀번호 틀림
        if (currentPW === newPW) throw 3; // 변경할 비밀번호와 현재 비밀번호 동일
        if (newPW !== confirmPW) throw 4; // 변경할 비밀번호화 확인 비밀번호 틀림

        const hashedInfo = await hashPassword(confirmPW);

        await prisma.admin.update({
          where: { admin_id: user.admin_id },
          data: { admin_salt: hashedInfo.salt, admin_password: hashedInfo.password, admin_passwordInit: false },
        });

        return true;
      } catch (e) {
        console.log("관리자 계정 비밀번호 변경 실패. editAdminPw ==>\n", e);
        if (e === 1) throw new Error("관리자만 사용가능한 기능입니다.");
        if (e === 2) throw new Error("입력하신 현재 비밀번호가 틀립니다. 정확한 비밀번호를 입력해주세요.");
        if (e === 3) throw new Error("현재 비밀번호와 새 비밀번호가 동일합니다. 다른 비밀번호를 입력해주세요.");
        if (e === 4) throw new Error("변경할 새 비밀번호와 확인 비밀번호가 다릅니다. 동일하게 입력해주세요.");
        throw new Error("관리자 계정 비밀번호 변경에 실패하였습니다.");
      }
    },
  },
};

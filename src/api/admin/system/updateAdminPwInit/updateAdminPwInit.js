import { PrismaClient } from "@prisma/client";
import { hashPassword, makeHashPassword } from "../../../../libs/passwordHashing";
import { genRandomCode } from "../../../../generate";
import sendEmail from "../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateAdminPwInit: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_id } = args;
      try {
        if (!user.admin_master) throw 1;
        const admin = await prisma.admin.findUnique({ where: { admin_id } });

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);

        const title = "메디플랫폼 비밀번호 찾기 안내 메일";
        const text = `안녕하세요. 메디플랫폼 비밀번호 찾기 안내 메일입니다.<br>생성된 임시 비밀번호는 아래와 같습니다.<br><br>ID(email) : ${admin.admin_email}<br>password : ${tempPw}<br><br>로그인 후 비밀번호를 변경하고 사용해주세요.<br>감사합니다.`;
        await sendEmail(admin.admin_email, title, text);

        const hashedInfo = await hashPassword(tempPw);

        await prisma.admin.update({
          where: { admin_id },
          data: {
            admin_salt: hashedInfo.salt,
            admin_password: hashedInfo.password,
            admin_passwordInit: true,
          },
        });

        return true;
      } catch (e) {
        console.log("관리자계정 비밀번호 초기화 실패. updateAdminPwInit", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02");
        throw new Error("err_00");
      }
    },
  },
};

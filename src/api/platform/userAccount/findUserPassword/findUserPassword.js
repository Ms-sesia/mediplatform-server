import { PrismaClient } from "@prisma/client";
import sendEmail from "../../../../libs/sendEmail";
import { hashPassword } from "../../../../libs/passwordHashing";
import { genRandomCode } from "../../../../generate";

const prisma = new PrismaClient();

export default {
  Mutation: {
    findUserPassword: async (_, args, { request, isAuthenticated }) => {
      const { email, name, cellphone } = args;
      try {
        const findUser = await prisma.user.findUnique({ where: { user_email: email } });

        if (!findUser) throw 1;
        if (findUser.user_isDelete) throw 1;

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);

        const title = "메디플랫폼 비밀번호 찾기 안내 메일";
        const text = `안녕하세요. 메디플랫폼 비밀번호 찾기 안내 메일입니다.<br>생성된 임시 비밀번호는 아래와 같습니다.<br><br>ID(email) : ${findUser.user_email}<br>password : ${tempPw}<br><br>로그인 후 비밀번호를 변경하고 사용해주세요.<br>감사합니다.`;
        await sendEmail(findUser.user_email, title, text);

        const hashedInfo = await hashPassword(tempPw);

        await prisma.user.update({
          where: { user_id: findUser.user_id },
          data: {
            user_salt: hashedInfo.salt,
            user_password: hashedInfo.password,
            user_passwordInit: true,
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 비밀번호 찾기 실패. findUserPassword => \n", e);
        if (e === 1) throw new Error("err_01"); // 존재하지 않거나 탈퇴된 계정입니다.
        throw new Error("err_00");
      }
    },
  },
};

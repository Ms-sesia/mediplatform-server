import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../generate";
import { hashPassword } from "../../../../libs/passwordHashing";
import sendEmail from "../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createAdmin: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { admin_name, admin_email, admin_rank, admin_cellphone } = args;
      try {
        if (!user.admin_master) throw 0;

        // 이메일 중복 체크
        const adminDuplicateCheck = await prisma.admin.findUnique({ where: { admin_email: admin_email } });
        if (adminDuplicateCheck) throw 1;

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);

        const title = "메디플랫폼 가입 안내 메일";
        const text = `안녕하세요. 메디플랫폼 관리자 계정생성 안내 메일입니다.<br>
        생성된 계정의 정보는 아래와 같습니다.<br>
        <br>
        아이디(email) : ${admin_email}<br>
        임시비밀번호 : ${tempPw}<br>
        <br>
        로그인 후 비밀번호를 변경하고 사용해주세요.<br>
        감사합니다.`;

        await sendEmail(admin_email, title, text);

        const hashedInfo = await hashPassword(tempPw);

        await prisma.admin.create({
          data: {
            admin_name,
            admin_email,
            admin_rank,
            admin_cellphone,
            admin_salt: hashedInfo.salt,
            admin_password: hashedInfo.password,
          },
        });

        return true;
      } catch (e) {
        console.log("관리자 추가 실패. createAdmin", e);
        if (e === 0) throw new Error("err_01");
        if (e === 1) throw new Error("err_02");
        throw new Error("err_00");
      }
    },
  },
};

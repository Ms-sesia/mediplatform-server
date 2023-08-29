import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../../generate";
import { hashPassword } from "../../../../../libs/passwordHashing";
import sendEmail from "../../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { name, birthday, cellphone, email, permission, org, rank, job } = args;
      try {
        // 이메일 중복 체크
        const emailDuplicateCheck = await prisma.user.findUnique({ where: { user_email: email } });
        if (emailDuplicateCheck) throw 1;

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);
        console.log(tempPw);

        const title = "메디플랫폼 가입 안내 메일";
        const text = `안녕하세요. 메디플랫폼 계정생성 안내 메일입니다.<br>생성된 계정의 정보는 아래와 같습니다.<br><br>ID(email) : ${email}<br>password : ${tempPw}<br><br>로그인 후 비밀번호를 변경하고 사용해주세요.<br>감사합니다.`;
        await sendEmail(email, title, text);

        const hashedInfo = await hashPassword(tempPw);

        await prisma.user.create({
          data: {
            user_name: name,
            user_birthday: birthday,
            user_cellphone: cellphone,
            user_email: email,
            user_permission: permission,
            user_org: org,
            user_rank: rank,
            user_job: job,
            user_salt: hashedInfo.salt,
            user_password: hashedInfo.password,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 추가 실패. createUser", e);
        if (e === 1) throw new Error("해당 이메일로 이미 가입된 사용자가 있습니다. 이메일을 확인해주세요.");
      }
    },
  },
};

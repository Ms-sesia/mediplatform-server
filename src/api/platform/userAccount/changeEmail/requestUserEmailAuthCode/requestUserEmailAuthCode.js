import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../../generate";
import sendEmail from "../../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    requestUserEmailAuthCode: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { email } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        // 탈퇴한 이메일
        const deleteCheckEmail = await prisma.user.findMany({
          where: { AND: [{ user_email: email }, { user_isDelete: true }] },
        });
        if (deleteCheckEmail.length) throw 1;

        const findEmail = await prisma.user.findMany({
          where: { AND: [{ user_email: email }, { user_isDelete: false }] },
        });
        if (findEmail.length) throw 2;

        // 8자리 인증코드
        const authCode = genRandomCode(8);

        const subject = `[메디플랫폼] 이메일 인증번호 발송`;

        const html = `안녕하세요. 메디플랫폼 이메일 인증메일입니다.<br/>인증번호는 ${authCode} 입니다.<br/> 감사합니다.`;

        await sendEmail(email, subject, html);

        // 다시 보내면 기존에 있는 번호 삭제
        await prisma.userEmailAuthCode.deleteMany({
          where: { user_id: loginUser.user_id },
        });

        await prisma.userEmailAuthCode.create({
          data: {
            ueac_code: authCode,
            ueac_email: email,
            user: { connect: { user_id: loginUser.user_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("이메일 인증코드 전송 실패. requestUserEmailAuthCode", e);
        if (e === 1) throw new Error("err_01");
        if (e === 2) throw new Error("err_02");
        throw new Error("err_00");
      }
    },
  },
};

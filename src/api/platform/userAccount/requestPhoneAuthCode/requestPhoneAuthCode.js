import { PrismaClient } from "@prisma/client";
import { generateSecretCode } from "../../../../generate";
import { sendAligoSMS } from "../../../../libs/aligo/sendAligoSMS";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    requestPhoneAuthCode: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { cellphone } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const authCode = generateSecretCode();

        await prisma.userPhoneAuthCode.create({
          data: {
            upac_createdAt: today9,
            upac_cellphone: cellphone,
            upac_code: authCode,
            user: { connect: { user_id: user.user_id } },
          },
        });

        const msg = `안녕하세요. 메디플랫폼입니다.\n인증번호는 ${authCode}입니다.`;

        await sendAligoSMS(cellphone, msg);

        return true;
      } catch (e) {
        console.log("휴대폰 인증번호 전송 실패. requestPhoneAuthCode", e);
        throw new Error("err_00");
      }
    },
  },
};

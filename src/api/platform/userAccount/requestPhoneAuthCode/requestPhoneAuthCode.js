import { PrismaClient } from "@prisma/client";
import { generateSecretCode } from "../../../../generate";
import { sendAligoSMS } from "../../../../libs/aligo/sendAligoSMS";
import sendSMS from "../../../../libs/sendSMS";

const prisma = new PrismaClient();

export default {
  Mutation: {
    requestPhoneAuthCode: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { cellphone } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        if (!hospital.hsp_messageTrId) throw 1;
        if (!hospital.hsp_messageSendNum) throw 1;

        const authCode = generateSecretCode();

        await prisma.userPhoneAuthCode.create({
          data: {
            upac_cellphone: cellphone.replaceAll("-", ""),
            upac_code: authCode,
            user: { connect: { user_id: user.user_id } },
          },
        });

        const msg = `안녕하세요. 메디플랫폼입니다.\n인증번호는 ${authCode}입니다.`;
        const today = new Date().toISOString();

        await sendSMS(
          today,
          msg,
          cellphone,
          loginUser.user_name,
          false,
          hospital.hsp_messageTrId,
          hospital.hsp_messageSendNum
        );

        return true;
      } catch (e) {
        console.log("휴대폰 인증번호 전송 실패. requestPhoneAuthCode", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

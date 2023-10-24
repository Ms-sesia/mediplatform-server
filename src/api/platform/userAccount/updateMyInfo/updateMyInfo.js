import { PrismaClient } from "@prisma/client";
import { today9 } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateMyInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { user_name, user_birthday, user_cellphone, user_address, user_detailAddress, authCode } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const findAuthcode = await prisma.userPhoneAuthCode.findMany({
          where: { upac_cellphone: { user_cellphone } },
        });

        if (findAuthcode.length) {
          await prisma.userPhoneAuthCode.deleteMany({ where: { upac_cellphone: user_cellphone } });
          throw 1;
        }

        if (findAuthcode[0].upac_code !== authCode) throw 2;

        const findUser = await prisma.user.findMany({
          where: { user_cellphone },
        });

        if (findUser.length) throw 3;

        await prisma.user.update({
          where: { user_id: user.user_id },
          data: {
            user_editorId: loginUser.user_id,
            user_editorName: loginUser.user_name,
            user_editorRank: loginUser.user_rank,
            user_name,
            user_birthday,
            user_cellphone,
            user_address,
            user_detailAddress,
          },
        });

        return true;
      } catch (e) {
        console.log("개인정보 수정 실패. updateMyInfo", e);
        if (e === 1) throw new Error("err_01"); // 전송된 인증번호가 없습니다. 다시 요청해주세요.
        if (e === 2) throw new Error("err_02"); // 인증번호가 일치하지 않습니다. 다시 입력해주세요.
        if (e === 3) throw new Error("err_03"); // 이미 사용중인 휴대폰 번호입니다. 확인 후 다시 입력해주세요.
        throw new Error("err_00");
      }
    },
  },
};

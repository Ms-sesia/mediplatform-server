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

        const findAuthcode = await prisma.userPhoneAuthCode.findFirst({
          where: { upac_cellphone: { contains: user_cellphone } },
          orderBy: { upac_createdAt: "desc" },
        });

        // 인증코드가 없을 경우
        if (!findAuthcode) throw 1;

        // 인증코드와 입력 코드가 다를경우
        if (findAuthcode.upac_code !== authCode) throw 2;

        // 입력한 휴대폰 번호와 로그인한 유저의 휴대폰번호가 다를 경우
        if (user_cellphone !== loginUser.user_cellphone) {
          // 입력한 휴대폰 번호 사용 유저
          const findUser = await prisma.user.findFirst({
            where: { AND: [{ hsp_id: loginUser.hsp_id }, { user_cellphone }, { user_isDelete: false }] },
          });
          // 사용자가 있을 경우
          if (findUser) {
            // 인증 번호 삭제
            await prisma.userPhoneAuthCode.deleteMany({ where: { upac_cellphone: user_cellphone } });

            throw 3;
          }

          // 입력한 휴대폰 번호 사용 유저가 없을 경우 번호 업데이트
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

          // 인증 번호 삭제
          await prisma.userPhoneAuthCode.deleteMany({ where: { upac_cellphone: user_cellphone } });
        } else {
          // 입력한 휴대폰 번호와 로그인한 유저의 휴대폰 번호가 같을 경우
          await prisma.user.update({
            where: { user_id: user.user_id },
            data: {
              user_editorId: loginUser.user_id,
              user_editorName: loginUser.user_name,
              user_editorRank: loginUser.user_rank,
              user_name,
              user_birthday,
              // user_cellphone,
              user_address,
              user_detailAddress,
            },
          });

          // 인증 번호 삭제
          await prisma.userPhoneAuthCode.deleteMany({ where: { upac_cellphone: user_cellphone } });
        }

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

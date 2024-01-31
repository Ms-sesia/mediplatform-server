import { PrismaClient } from "@prisma/client";
import { maskEmail } from "../../../../libs/masking";

const prisma = new PrismaClient();

export default {
  Mutation: {
    findUserAccountId: async (_, args, __) => {
      const { hospitalName, cellphone } = args;
      try {
        const user = await prisma.user.findMany({
          where: {
            AND: [
              { hospital: { hsp_name: { contains: hospitalName } } },
              { user_cellphone: cellphone ? cellphone : undefined },
              { user_isDelete: false },
            ],
          },
        });

        if (!user.length) return [];

        const userMails = user.map((userInfo) => {
          return maskEmail(userInfo.user_email);
        });

        return userMails.length ? userMails : [];
      } catch (e) {
        console.log("사용자 아이디 찾기 실패. findUserAccountId", e);
        if (e === 1) throw new Error("err_01"); // 가입되지 않았거나 탈퇴된 정보입니다.
        throw new Error("err_00"); // 사용자 아이디 찾기에 실패하였습니다.
      }
    },
  },
};

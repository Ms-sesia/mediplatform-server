import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    findUserAccountId: async (_, args, __) => {
      const { name, cellphone } = args;
      try {
        const user = await prisma.user.findMany({
          where: { AND: [{ user_name: name }, { user_cellphone: cellphone }, { user_isDelete: false }] },
        });

        if (!user.length) throw 1;

        return {
          result: true,
          user_email: user[0].user_email,
        };
      } catch (e) {
        console.log("사용자 아이디 찾기 실패. findUserAccountId", e);
        if (e === 1) throw new Error("가입되지 않은 정보입니다. 다시 확인하고 입력해주세요.");
        throw new Error("사용자 아이디 찾기에 실패하였습니다.");
      }
    },
  },
};

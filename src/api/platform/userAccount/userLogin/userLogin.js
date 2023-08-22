import { PrismaClient } from "@prisma/client";
import { generateToken } from "../../../../generate";
import { makeHashPassword } from "../../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    userLogin: async (_, args, { request, __ }) => {
      const { accountId, password } = args;
      try {
        // 사용자 체크
        let user = await prisma.user.findUnique({ where: { user_email: accountId } });
        if (!user) throw 1;

        // 솔트 확인
        const salt = user.user_salt;
        // 솔트를 이용한 pw 해싱
        const makePassword = await makeHashPassword(salt, password);

        const passwordConfirm = user.user_password === makePassword.password ? true : false;

        if (!passwordConfirm) throw 1;

        user = await prisma.user.findUnique({
          where: { user_email: user.user_email },
          select: {
            user_id: true,
            userType: true,
            userPermission: true,
            user_passwordInit: true,
          },
        });

        const loginToken = generateToken(user);

        return loginToken;
      } catch (e) {
        console.log("사용자 로그인 실패. userLogin", e);
        if (e === 1) throw new Error("로그인에 실패하였습니다.");
        if (e === 2) throw new Error("로그인 시도회수가 10번이 넘었습니다. 10분 후 다시 시도해주세요.");
        throw new Error("사용자 로그인에 실패하였습니다.");
      }
    },
  },
};

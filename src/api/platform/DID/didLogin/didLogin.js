import { PrismaClient } from "@prisma/client";
import { makeHashPassword } from "../../../../libs/passwordHashing";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default {
  Mutation: {
    didLogin: async (_, args, { request, __ }) => {
      const { accountId, password, did_uniqueId } = args;
      try {
        // 사용자 체크
        let user = await prisma.user.findUnique({ where: { user_email: accountId } });
        if (!user) throw 1;

        // 사용자가 did병원과 일치하는지 확인
        const did = await prisma.did.findUnique({ where: { did_uniqueId } });
        if (user.hsp_id !== did.hsp_id) throw 2;

        // 솔트 확인
        const salt = user.user_salt;
        // 솔트를 이용한 pw 해싱
        const makePassword = await makeHashPassword(salt, password);

        const passwordConfirm = user.user_password === makePassword.password ? true : false;

        if (!passwordConfirm) throw 1;

        user = await prisma.user.findUnique({
          where: { user_email: user.user_email },
          select: { user_email: true },
        });

        const loginToken = didLoginToken(user);

        console.log({
          did_id: did.did_id,
          email: user.user_email,
          token: loginToken,
        });

        return {
          did_id: did.did_id,
          email: user.user_email,
          token: loginToken,
        };
      } catch (e) {
        console.log("did 로그인 실패. didLogin", e);
        if (e === 1) throw new Error("DID 모니터 로그인에 실패하였습니다.");
        if (e === 2) throw new Error("해당 병원의 사용자가 아닙니다. DID를 사용하려는 병원의 사용자로 로그인해주세요.");
        throw new Error("DID 모니터 로그인에 실패하였습니다.");
      }
    },
  },
};

const didLoginToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET);
};

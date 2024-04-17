import { PrismaClient } from "@prisma/client";
import { makeHashPassword } from "../../../../libs/passwordHashing";
import jwt from "jsonwebtoken";
import webSocket from "../../../../libs/webSocket/webSocket";

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

        // 모니터 유니트 값이 없는 경우
        if (!did_uniqueId) throw 3;
        // 삭제된 모니터
        if (did.did_isDelete) throw 4;

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

        const reqWaitingPatiInfo = {
          SendStatus: "reqWaitingPatient",
          didUniqueId: did_uniqueId,
          request: true,
        };

        const pub = (await webSocket()).pub;
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: did.hsp_id } });

        const channel = `h-${hospital.hsp_email}`;

        // await pub.publish(did.did_uniqueId, JSON.stringify(reqWaitingPatiInfo));
        await pub.publish(channel, JSON.stringify(reqWaitingPatiInfo));

        return {
          did_id: did.did_id,
          email: user.user_email,
          token: loginToken,
        };
      } catch (e) {
        console.log("did 로그인 실패. didLogin", e);
        if (e === 1) throw new Error("DID 모니터 로그인에 실패하였습니다.");
        if (e === 2) throw new Error("해당 병원의 사용자가 아닙니다. DID를 사용하려는 병원의 사용자로 로그인해주세요.");
        if (e === 3) throw new Error("모니터 주소를 다시 확인해주세요.");
        if (e === 4) throw new Error("삭제된 모니터입니다.");
        throw new Error("DID 모니터 로그인에 실패하였습니다.");
      }
    },
  },
};

const didLoginToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET);
};

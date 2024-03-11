import { PrismaClient } from "@prisma/client";
import useragent from "useragent";
import { generateToken } from "../../../../generate";
import { makeHashPassword } from "../../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    userLogin: async (_, args, { request, __ }) => {
      const { accountId, password } = args;
      try {
        // 사용자 체크
        const findUser = await prisma.user.findMany({
          where: { AND: [{ user_email: accountId }, { user_isDelete: false }] },
        });

        if (!findUser.length) throw 0;

        let user = await prisma.user.findUnique({ where: { user_email: accountId } });
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
            user_rank: true,
            user_passwordInit: true,
            hospital: { select: { hsp_id: true } },
          },
        });

        const ip = request.headers["x-forwarded-for"];
        // os, browser 정보
        const agent = useragent.parse(request.headers["user-agent"]);

        await prisma.userLoginHistory.create({
          data: {
            ulh_ip: ip,
            ulh_os: agent.os.toString(),
            ulh_browser: agent.toAgent(),
            ulh_status: true,
            user: { connect: { user_id: user.user_id } },
          },
        });

        const exprdHsp = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });
        if (exprdHsp.hsp_useEnded) throw 3;

        const loginToken = generateToken(user);

        return loginToken;
      } catch (e) {
        console.log("사용자 로그인 실패. userLogin error:", e);
        if (e === 0) throw new Error("존재하지 않거나 삭제된 사용자입니다.");
        if (e === 1) throw new Error("로그인에 실패하였습니다.");
        if (e === 2) throw new Error("로그인 시도회수가 10번이 넘었습니다. 10분 후 다시 시도해주세요.");
        if (e === 3) throw new Error("병원 사용기간 만료, 플랫폼관리자에게 문의하세요.");
        throw new Error("사용자 로그인에 실패하였습니다.");
      }
    },
  },
};

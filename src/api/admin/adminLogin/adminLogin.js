import { PrismaClient } from "@prisma/client";
import useragent from "useragent";
import { generateToken } from "../../../generate";
import { createAdminLoginHistory } from "../../../libs/createLog";
import { makeHashPassword } from "../../../libs/passwordHashing";

const prisma = new PrismaClient();

export default {
  Mutation: {
    adminLogin: async (_, args, { request, __ }) => {
      const { admin_email, admin_password } = args;
      try {
        // 이메일 체크
        let admin = await prisma.admin.findUnique({ where: { admin_email: admin_email } });
        if (!admin) throw 1;
        console.log(admin);

        const ip = request.headers["x-forwarded-for"];

        // 로그인 제한시간이 10분이 경과되었을 경우 시도횟수 및 시간 초기화
        const checkLoginTime = new Date().toISOString();
        console.log(checkLoginTime);
        if (admin.admin_loginFailTime && admin.admin_loginFailTime < checkLoginTime) {
          await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: { admin_loginFailTime: "", admin_doLoginCount: 0 },
          });
        }

        // 아직 로그인 제한시간이 남아있음
        if (admin.admin_loginFailTime) throw 2;

        // 로그인 시도 횟수가 10번이 넘을 경우
        if (admin.admin_doLoginCount >= 10) {
          const failTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10)).toISOString();

          await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: { admin_loginFailTime: failTime },
          });

          throw 2;
        }

        // 솔트 확인
        const salt = admin.admin_salt;
        // 솔트를 이용한 pw 해싱
        const makePassword = await makeHashPassword(salt, admin_password);

        const passwordConfirm = admin.admin_password === makePassword.password ? true : false;

        // 비밀번호 불일치
        if (!passwordConfirm) {
          // 실패시 카운트 증가
          await prisma.admin.update({
            where: { admin_id: admin.admin_id },
            data: { admin_doLoginCount: admin.admin_doLoginCount + 1 },
          });

          throw 3;
        }

        const adminUser = await prisma.admin.findUnique({
          where: { admin_email: admin_email },
          select: {
            admin_id: true,
            userType: true,
            admin_master: true,
            admin_passwordInit: true,
          },
        });

        // os, browser 정보
        const agent = useragent.parse(request.headers["user-agent"]);

        // 로그인 로그
        const loginInfo = {
          alh_ip: ip,
          alh_os: agent.os.toString(),
          alh_browser: agent.toAgent(),
          alh_status: true,
        };

        await createAdminLoginHistory(admin.admin_id, loginInfo);

        const loginToken = generateToken(adminUser);

        // 토큰 업데이트 및 시도횟수 초기화
        admin = await prisma.admin.update({
          where: { admin_id: adminUser.admin_id },
          data: {
            // admin_loginToken: loginToken,
            admin_doLoginCount: 0,
          },
        });

        return loginToken;
      } catch (e) {
        console.log("관리자 로그인 실패. adminLogin", e);
        if (e === 1) {
          console.log("사용자 없음.");
          throw new Error("로그인에 실패하였습니다.");
        }
        if (e === 2) throw new Error("로그인 시도회수가 10번이 넘었습니다. 10분 후 다시 시도해주세요.");
        if (e === 3) {
          console.log("관리자 비밀번호 틀림.");
          throw new Error("로그인에 실패하였습니다.");
        }
        throw new Error("관리자 로그인에 실패하였습니다.");
      }
    },
  },
};

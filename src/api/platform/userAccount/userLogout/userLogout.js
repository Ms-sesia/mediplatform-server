import { PrismaClient } from "@prisma/client";
import useragent from "useragent";

const prisma = new PrismaClient();

export default {
  Mutation: {
    userLogout: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const ip = request.headers["x-forwarded-for"];
        // os, browser 정보
        const agent = useragent.parse(request.headers["user-agent"]);

        await prisma.userLoginHistory.create({
          data: {
            ulh_ip: ip,
            ulh_os: agent.os.toString(),
            ulh_browser: agent.toAgent(),
            ulh_status: false,
            user: { connect: { user_id: user.user_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("사용자 로그아웃 실패. userLogout error:", e);
        if (e === 0) throw new Error("존재하지 않거나 삭제된 사용자입니다.");
        throw new Error("사용자 로그아웃에 실패하였습니다.");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeUserLoginHistory: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { orderBy, take, cursor } = args;
      try {
        const userLoginTotalList = await prisma.userLoginHistory.findMany({
          orderBy: { ulh_createdAt: orderBy },
        });

        if (!userLoginTotalList.length)
          return {
            totalLength: 0,
            userLoginHistories: [],
          };

        const cursorId = userLoginTotalList[cursor].ulh_id;
        const cursorOpt = cursor === 0 ? { take } : { take, skip: 0, cursor: { ulh_id: cursorId } };

        const loginHistoryList = await prisma.userLoginHistory.findMany({
          ...cursorOpt,
          orderBy: { ulh_createdAt: orderBy },
        });

        const histories = loginHistoryList.map(async (lh) => {
          const findUser = await prisma.user.findUnique({ where: { user_id: lh.user_id } });
          lh.ulh_id = lh.ulh_id;
          lh.createdAt = new Date(lh.ulh_createdAt).toISOString();
          lh.ip = lh.ulh_ip;
          lh.os = lh.ulh_os;
          lh.browser = lh.ulh_browser;
          lh.userName = findUser.user_name;
          lh.userRank = findUser.user_rank;
          lh.email = findUser.user_email;
          lh.status = lh.ulh_status;

          return lh;
        });

        return {
          totalLength: userLoginTotalList.length,
          userLoginHistories: loginHistoryList.length ? histories : [],
        };
      } catch (e) {
        console.log("사용자 로그인 기록 조회 실패. seeUserLoginHistory ==>\n", e);
        throw new Error("err_00"); // 사용자 로그인 기록 조회에 실패하였습니다.
      }
    },
  },
};

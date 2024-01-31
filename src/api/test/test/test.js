import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        console.log("사용자 휴대폰번호 '-' 제거", term.replaceAll("-", ""));

        // console.log(`${today9.toISOString().split("T")[0]} : 병원 플랫폼 이용 만료일 확인 완료.`);
        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};

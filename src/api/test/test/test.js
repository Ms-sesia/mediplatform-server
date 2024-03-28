import { PrismaClient } from "@prisma/client";
import sendSMS from "../../../libs/sendSMS";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { term } = args;
      try {
        //         const msg = `
        //         80자 이상으로 LMS를 전송해봅니다. 테스트 전송입니다.
        // 80자 이상으로 LMS를 전송해봅니다. 테스트 전송입니다.
        // 80자 이상으로 LMS를 전송해봅니다. 테스트 전송입니다.
        // 80자 이상으로 LMS를 전송해봅니다. 테스트 전송입니다.
        // 80자 이상으로 LMS를 전송해봅니다. 테스트 전송입니다.
        // `;
        const msg = `80자 이하로 SMS를 전송해봅니다. 테스트 전송입니다.`;
        await sendSMS(new Date(), msg, "01028355820", "이영광");

        return true;
      } catch (e) {
        console.log("test error =>", e);
        if (e.errorCode === 1) console.log("정확하지 않은 핸드폰번호는 카카오톡 발송이 불가능합니다.", e);
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";
import sendEmail from "../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test: async (_, args, { request, isAuthenticated }) => {
      // isAuthenticated(request);
      // const { user } = request;
      const { term } = args;
      try {
        const title = "[test] 메디플랫폼 가입 안내 메일";
        const text = `안녕하세요. 메디플랫폼 입니다.<br>
        이 메일은 메디플랫폼 테스트 발송 메일입니다.<br>
        <br>
        메일을 받으신 분은 삭제하셔도 됩니다..<br>     
        <br>
        감사합니다.`;
        const userList = await prisma.user.findMany({
          select: { user_email: true },
        });

        const mailList = userList.map((ul) => ul.user_email);
        const strMailList = mailList.join();

        console.log(strMailList);
        await sendEmail(strMailList, title, text);

        return true;
      } catch (e) {
        console.log("test =>", e);
        throw new Error("err_00");
      }
    },
  },
};

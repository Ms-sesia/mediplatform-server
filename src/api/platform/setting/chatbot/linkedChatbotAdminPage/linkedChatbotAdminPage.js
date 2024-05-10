import { PrismaClient } from "@prisma/client";
import getInfobankToken from "../../../../expApi/router/Infobank/getInfobankToken";
import axios from "axios";

const prisma = new PrismaClient();

export default {
  Mutation: {
    linkedChatbotAdminPage: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        // const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        // 인포뱅크 토큰
        const getToken = (await getInfobankToken()).accessToken;

        const url =
          process.env.NODE_ENV === "production"
            ? `https://cbadmin.infobank.net/login?botId=${hospital.hsp_chatbotId}&accessToken=${getToken}`
            : `https://devmsg.supersms.co:9447/login?botId=${hospital.hsp_chatbotId}&accessToken=${getToken}`;

        return url;
      } catch (e) {
        console.log("인포뱅크 챗봇 관리자페이지 링크 연결 실패. linkedChatbotAdminPage:", e);
        throw new Error("인포뱅크 챗봇 관리자페이지 링크 연결 실패.");
      }
    },
  },
};

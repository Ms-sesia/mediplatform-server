import { PrismaClient } from "@prisma/client";
import axios from "axios";
import getInfobankToken from "../../../../expApi/router/Infobank/getInfobankToken";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateChatbotInfo: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        // 인포뱅크 토큰
        const getToken = (await getInfobankToken()).accessToken;
        const url =
          process.env.NODE_ENV === "production"
            ? "https://chatbot.infobank.net:7443/chatbot/api/bot-info/bots/update"
            : "https://devmsg.supersms.co/chatbot/api/bot-info/bots/update";

        /**
         * channelUrl : 병원에 등록된 카카오 채널 url
         * name: 병원에 등록된 카카오 채널 id
         * careFacilityNumber : 요양기관번호
         * managerEmail : 병원 대표 이메일
         * partnerKey : MDSFT
         */
        const chatbotInfo = {
          channelUrl: hospital.hsp_kakaoChannelUrl,
          name: hospital.hsp_kakaoChannelId,
          careFacilityNumber: hospital.hsp_hospitalNumber,
          managerEmail: hospital.hsp_email,
          partnerKey: process.env.MS_IB_PARTNERKEY,
        };

        const updateResult = await axios.put(url, chatbotInfo, {
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
            Accept: "application/json",
            Authorization: `Bearer ${getToken}`,
          },
        });

        console.log("update chatbot Result:", updateResult.data);

        return true;
      } catch (e) {
        console.log("챗봇 정보 수정 실패. updateChatbotInfo:", e.response.data.errMsg);
        throw new Error(e.response.data.errMsg);
      }
    },
  },
};

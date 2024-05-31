import axios from "axios";

const getInfobankToken = async () => {
  try {
    const getTokenUrl =
      process.env.NODE_ENV === "production"
        ? "https://chatbot.infobank.net:7443/chatbot/cors/aaa-service/api/token"
        : "https://devmsg.supersms.co/chatbot/cors/aaa-service/api/token"; // 개발용 새로 전달받은 api

    // console.log("process.env.NODE_ENV :", process.env.NODE_ENV);
    // console.log("getTokenUrl:", getTokenUrl);

    const result = await axios.post(getTokenUrl, {
      accountId: process.env.CHATBOT_ID,
      plainPassword: process.env.CHATBOT_PW,
    });

    return {
      accessToken: result.data.response.accessToken,
      refreshToken: result.data.response.refreshToken,
    };
  } catch (e) {
    console.log("인포뱅크 토큰 수령 오류. getInfobankToken error :", e);
    throw new Error("인포뱅크 토큰 수령 오류.");
  }
};

export default getInfobankToken;

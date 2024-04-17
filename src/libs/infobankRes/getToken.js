import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const getToken = async () => {
  const sendUrl = "https://chatbot.infobank.net:7443/chatbot/cors/aaa-service/api/token";

  const reqData = {
    accountId: process.env.CHATBOT_ID,
    plainPassword: process.env.CHATBOT_PW,
  };

  console.log(reqData);

  try {
    const reqTokenResult = await axios.post(sendUrl, reqData);

    console.log("getToken전송 결과:", reqTokenResult.data);

    return reqTokenResult.data;
  } catch (e) {
    console.log("infobank getToken error:", { message: e.message, code: e.code });
  }
};

export default getToken;

import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export default {
  Mutation: {
    infoKakaoAlimTalk: async (_, args, __) => {
      try {
        const tokenPublishUrl = "https://msggw-auth.supersms.co:9440/auth/v1/token";
        const messageUrl = "https://msggw.supersms.co:9443/v1/send/kko";
        const senderKey = "0139d6202c40c484a9e56936a9765b16829285c9";

        const tokenResData = await axios.post(
          tokenPublishUrl,
          {},
          {
            headers: {
              "X-IB-Client-Id": process.env.KAKAO_ID,
              "X-IB-Client-Passwd": process.env.KAKAO_PW,
              "Content-Type": "application/json;charset=UTF-8",
              Accept: "application/json",
            },
          }
        );

        const tokenInfo = tokenResData.data;

        const templateCode = "0139d6202c40c484a9e56936a9765b";
        const template =
          `"안녕하세요. 이영광님, 플랫큐브입니다.\n` +
          "10:00 홍길동 원장으로 진료 예약이 되어 있었습니다.\n" +
          "\n" +
          `재 예약을 원하시면 미리 02-3407-5450로 연락 주시기 바랍니다.\n` +
          `병원 홈페이지: www.platcube.com\n` +
          "\n" +
          `감사합니다."`;

        const kakaoSendBody = {
          msg_type: "AL",
          mt_failover: "N",
          msg_data: {
            to: "821028355820",
            content: template,
          },
          msg_attr: {
            sender_key: senderKey, // 과장님께 문의
            template_code: templateCode,
            response_method: "push",
            attachment: {
              button: [
                {
                  name: "채널 추가",
                  type: "AC",
                },
              ],
            },
          },
        };

        const sendResData = await axios.post(messageUrl, kakaoSendBody, {
          headers: {
            Authorization: `${tokenInfo.schema} ${tokenInfo.accessToken}`,
            "Content-Type": "application/json;charset=UTF-8",
            Accept: "application/json",
          },
        });

        return true;
      } catch (e) {
        console.log("test error =>", e);
      }
    },
  },
};

const testTemplate = `"안녕하세요. #{환자명}님, #{병원명}입니다.
#{시간} #{진료의명} 원장으로 진료 예약이 되어 있었습니다.

재 예약을 원하시면 미리 #{문의 전화번호}로 연락 주시기 바랍니다.
병원 홈페이지: #{url}

감사합니다."`;

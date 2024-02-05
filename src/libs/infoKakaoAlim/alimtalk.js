import axios from "axios";

// 인포뱅크 카카오 알림톡 발송
export const sendAlimTalk = async (tokenInfo, cellphone, templateCode, template) => {
  try {
    const kakaoSendBody = {
      msg_type: "AL",
      mt_failover: "N",
      msg_data: {
        to: cellphone,
        content: template,
      },
      msg_attr: {
        sender_key: process.env.INFO_KAKAO_SENDERKEY,
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

    const sendResData = await axios.post(process.env.INFO_KAKAO_MSGSENDURL, kakaoSendBody, {
      headers: {
        Authorization: `${tokenInfo.schema} ${tokenInfo.accessToken}`,
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
    });

    // console.log("kakao alim talk 전송 결과 :", sendResData.data);
  } catch (e) {
    console.log("kakao alim talk 전송 에러. =>", e);
  }
};

// 인포뱅크 카카오 알림톡 토큰발행
export const getAlimTalkToken = async () => {
  const tokenInfo = (
    await axios.post(
      process.env.INFO_KAKAO_TOKENURL,
      {},
      {
        headers: {
          "X-IB-Client-Id": process.env.KAKAO_ID,
          "X-IB-Client-Passwd": process.env.KAKAO_PW,
          "Content-Type": "application/json;charset=UTF-8",
          Accept: "application/json",
        },
      }
    )
  ).data;

  return tokenInfo;
};

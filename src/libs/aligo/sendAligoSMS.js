import * as aligo from ".";

export const sendAligoSMS = async (cellphone, msg) => {
  const Auth = {
    key: process.env.SMSKEY,
    user_id: process.env.SMSUSERID,
  };

  const req = {
    headers: {
      "content-type": "json",
    },
    body: {
      sender: process.env.SMSSENDER,
      receiver: cellphone,
      title: "[RiskZero_HG]",
      msg,
    },
  };

  try {
    const res = await aligo.send(req, Auth);
    return {
      result: true,
      error: "",
    };
  } catch (err) {
    console.log("aligo 문자 발송 에러:", err);
    return {
      result: false,
      error: "문자 메세지 전송에 실패하였습니다.",
    };
  }
};

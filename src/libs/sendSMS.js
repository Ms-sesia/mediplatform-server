import mssql from "mssql";

const mssqlConfig = {
  user: process.env.PR_USER_ID,
  password: process.env.PR_PASSWORD,
  database: process.env.PR_DB,
  server: process.env.PR_SERVER,
  port: parseInt(process.env.PR_PORT),
  requestTimeout: 60000, // 요청 시간이 길어지면 60초 후 끊김
  options: {
    encrypt: false,
    trustServerCertificate: true,
    tdsVersion: "7_4", // 예: TDS 버전 7.4 사용. 필요에 따라 버전을 조정하세요.
  },
};

export default async (time, msg, cellphone, receiverName, resSelect) => {
  const sendTime = new Date(time);
  try {
    await mssql.connect(mssqlConfig);
    const result = await mssql.query`
    INSERT INTO SC_TRAN
      (
        TR_ID ,
        TR_SENDDATE ,
        TR_SENDSTAT ,
        TR_MSGTYPE ,
        TR_PHONE ,
        TR_CALLBACK ,
        TR_MSG ,
        TR_ETC1 ,
        TR_ETC2
      )
    VALUES
      (
        ${process.env.PR_AUTH_ID},
        ${sendTime},
        '0',
        '0',
        ${cellphone},
        ${process.env.PR_CALLBACK_PHONE},
        ${msg},
        ${resSelect ? "Y" : "N"},
        ${receiverName}
      ); `;
    console.log(result);
    return {
      status: "success",
      message: `${receiverName}님에게 문자 발송에 성공하였습니다.`,
    };
  } catch (e) {
    console.log("문자 발송 실패.", e);
    return {
      status: "fail",
      message: `Send sms fail: ${e}`,
    };
  }
};

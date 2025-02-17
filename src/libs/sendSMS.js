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

export default async (time, msg, cellphone, receiverName, resSelect, trId, sendNum) => {
  const sendTime = new Date(time);
  try {
    await mssql.connect(mssqlConfig);

    let result;
    if (msg.length > 80) {
      console.log("lms전송");
      result = await mssql.query`
      INSERT INTO MMS_MSG
        (
          SUBJECT,
          PHONE,
          CALLBACK,
          STATUS,
          REQDATE,
          MSG,
          TYPE,
          ID
        )
      VALUES
        (
          '[메디칼소프트 예약 알림]',
          ${cellphone},
          ${sendNum},
          '0',
          ${sendTime},
          ${msg},
          '0',
          ${trId}
        ); `;
      console.log("sendTime:", sendTime);
    } else {
      result = await mssql.query`
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
          ${trId},
          ${sendTime},
          '0',
          '0',
          ${cellphone},
          ${sendNum},
          ${msg},
          ${resSelect ? "Y" : "N"},
          ${receiverName}
        ); `;
    }

    console.log("sms send result:", result);
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

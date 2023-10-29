import { PrismaClient } from "@prisma/client";
import mssql from "mssql";

const prisma = new PrismaClient();

export default {
  Mutation: {
    sendPrcompanySMSTest: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { patientName, textMsg, cellphone, receiverName, resSend } = args;

      const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

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
      const today = new Date();
      const offsetTime = 1000 * 60 * 60 * 9; // 한국시간 GMT+9 에 맞추기 위한 +9
      const calTimeMs = 1000 * 60 * 1; // 1분
      const nowTime = new Date().getTime() + offsetTime;
      const sendTime = new Date(nowTime + calTimeMs);

      const alimTemplate = await prisma.resAlimTemplate.findUnique({
        where: { rat_id: 1 },
      });

      const text = alimTemplate.rat_text;
      console.log(text);

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
            ${textMsg},
            'N',
            ${receiverName}
            ); `;
        // ${resSend ? "Y" : "N"},
        console.log(result);

        return true;
      } catch (e) {
        console.log("prcompnay 문자 전송 테스트 실패. sendPrcompanySMSTest", e);
        throw new Error("err_00");
      }
    },
  },
};

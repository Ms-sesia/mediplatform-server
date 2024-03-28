import { PrismaClient } from "@prisma/client";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Query: {
    reqWaitingPatientList: async (_, args, { request, __ }) => {
      const { hospitalEmail } = args;
      try {
        const reqWaitingPatiInfo = {
          SendStatus: "reqWaitingPatient",
          request: true,
        };

        const pub = (await webSocket()).pub;

        const channel = `h-${hospitalEmail}`;

        await pub.publish(channel, JSON.stringify(reqWaitingPatiInfo));

        return true;
      } catch (e) {
        console.log("did 모니터 대기환자 목록 요청 실패. reqWaitingPatientList", e);
        return false;
      }
    },
  },
};

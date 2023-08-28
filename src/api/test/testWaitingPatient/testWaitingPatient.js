import { PrismaClient } from "@prisma/client";
import webSocket from "../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    testWaitingPatient: async (_, args, __) => {
      try {
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-admin@platcube.com`;

        const waitingPatientInfo = {
          SendStatus: "send",
          ExistsWaiting: true,
          WaitingDate: "20230828",
          Email: "yglee@platcube.com",
          WaitingList: [
            {
              DeptCode: "1",
              WaitingSeq: "1",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "13:57",
              ChartNo: "100",
              PatientName: "홍길동",
              Gender: "남",
              Bitrh: "1983.02.25",
              Age: "40세",
              Memo: "접수메모1",
            },
            {
              DeptCode: "2",
              WaitingSeq: "2",
              DeptName: "제2진료실",
              WaitingStatus: "대 기",
              DoctorName: "김소아",
              ReceptionTime: "13:58",
              ChartNo: "200",
              PatientName: "홍길순",
              Gender: "여",
              Bitrh: "1960.10.17",
              Age: "62세",
              Memo: "접수메모2",
            },
          ],
        };

        await pub.publish(channelName, JSON.stringify(waitingPatientInfo));

        return true;
      } catch (e) {
        console.log("관리자 목록 조회 실패. seeDidMonitors ==>\n", e);
        throw new Error("관리자 목록 조회에 실패하였습니다.");
      }
    },
    testCallPatient: async (_, args, __) => {
      try {
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-admin@platcube.com`;

        const callPatientInfo = {
          SendStatus: "call",
          WaitingDate: "20230828",
          Email: "yglee@platcube.com",
          DeptName: "부서명",
          PatientName: "환자명",
        };
        await pub.publish(channelName, JSON.stringify(callPatientInfo));
        return true;
      } catch (e) {
        console.log("관리자 목록 조회 실패. seeDidMonitors ==>\n", e);
        throw new Error("관리자 목록 조회에 실패하였습니다.");
      }
    },
  },
};

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
          Email: "admin@platcube.com",
          WaitingList: [
            {
              DeptCode: "6",
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
              DeptCode: "5",
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
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "15:58",
              ChartNo: "110",
              PatientName: "이영광",
              Gender: "남",
              Bitrh: "1987.10.12",
              Age: "37세",
              Memo: "접수메모3",
            },
            {
              DeptCode: "6",
              WaitingSeq: "1",
              DeptName: "제1진료실",
              WaitingStatus: "보류중",
              DoctorName: "이이빈",
              ReceptionTime: "10:17",
              ChartNo: "140",
              PatientName: "박동현",
              Gender: "남",
              Bitrh: "1992.04.05",
              Age: "32세",
              Memo: "접수메모4",
            },
            {
              DeptCode: "5",
              WaitingSeq: "2",
              DeptName: "제2진료실",
              WaitingStatus: "대 기",
              DoctorName: "김소아",
              ReceptionTime: "17:58",
              ChartNo: "220",
              PatientName: "박동한",
              Gender: "남",
              Bitrh: "1990.10.17",
              Age: "34세",
              Memo: "접수메모5",
            },
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "진료중",
              DoctorName: "이이빈",
              ReceptionTime: "10:12",
              ChartNo: "160",
              PatientName: "김소은",
              Gender: "여",
              Bitrh: "1998.07.24",
              Age: "26세",
              Memo: "접수메모6",
            },
            {
              DeptCode: "6",
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
              DeptCode: "5",
              WaitingSeq: "2",
              DeptName: "제2진료실",
              WaitingStatus: "진료중",
              DoctorName: "김소아",
              ReceptionTime: "13:58",
              ChartNo: "200",
              PatientName: "홍길순",
              Gender: "여",
              Bitrh: "1960.10.17",
              Age: "62세",
              Memo: "접수메모2",
            },
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "15:58",
              ChartNo: "110",
              PatientName: "이영광",
              Gender: "남",
              Bitrh: "1987.10.12",
              Age: "37세",
              Memo: "접수메모3 응급",
            },
            {
              DeptCode: "6",
              WaitingSeq: "1",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "10:17",
              ChartNo: "140",
              PatientName: "박동현",
              Gender: "남",
              Bitrh: "1992.04.05",
              Age: "32세",
              Memo: "접수메모4",
            },
            {
              DeptCode: "5",
              WaitingSeq: "2",
              DeptName: "제2진료실",
              WaitingStatus: "대 기",
              DoctorName: "김소아",
              ReceptionTime: "17:58",
              ChartNo: "220",
              PatientName: "박동한",
              Gender: "남",
              Bitrh: "1990.10.17",
              Age: "34세",
              Memo: "접수메모5",
            },
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "10:12",
              ChartNo: "160",
              PatientName: "김소은",
              Gender: "여",
              Bitrh: "1998.07.24",
              Age: "26세",
              Memo: "접수메모6",
            },
            {
              DeptCode: "6",
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
              DeptCode: "6",
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
              Memo: "접수메모2 응급",
            },
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "15:58",
              ChartNo: "110",
              PatientName: "이영광",
              Gender: "남",
              Bitrh: "1987.10.12",
              Age: "37세",
              Memo: "접수메모3",
            },
            {
              DeptCode: "6",
              WaitingSeq: "1",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "10:17",
              ChartNo: "140",
              PatientName: "박동현",
              Gender: "남",
              Bitrh: "1992.04.05",
              Age: "32세",
              Memo: "접수메모4",
            },
            {
              DeptCode: "5",
              WaitingSeq: "2",
              DeptName: "제2진료실",
              WaitingStatus: "보류중",
              DoctorName: "김소아",
              ReceptionTime: "17:58",
              ChartNo: "220",
              PatientName: "박동한",
              Gender: "남",
              Bitrh: "1990.10.17",
              Age: "34세",
              Memo: "접수메모5",
            },
            {
              DeptCode: "6",
              WaitingSeq: "3",
              DeptName: "제1진료실",
              WaitingStatus: "대 기",
              DoctorName: "이이빈",
              ReceptionTime: "10:12",
              ChartNo: "160",
              PatientName: "김소은",
              Gender: "여",
              Bitrh: "1998.07.24",
              Age: "26세",
              Memo: "접수메모6",
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

        const callPatientInfo = [
          {
            SendStatus: "call",
            WaitingDate: "20230828",
            Email: "admin@platcube.com",
            DeptName: "제1진료실",
            DeptCode: "6",
            PatientName: "이영광",
          },
          {
            SendStatus: "call",
            WaitingDate: "20230828",
            Email: "admin@platcube.com",
            DeptName: "제2진료실",
            DeptCode: "5",
            PatientName: "박동현",
          },
          {
            SendStatus: "call",
            WaitingDate: "20230828",
            Email: "admin@platcube.com",
            DeptName: "제1진료실",
            DeptCode: "6",
            PatientName: "박동한",
          },
          {
            SendStatus: "call",
            WaitingDate: "20230828",
            Email: "admin@platcube.com",
            DeptName: "제2진료실",
            DeptCode: "5",
            PatientName: "테스트",
          },
        ];

        const seq = Math.floor(Math.random() * 4);
        const callPatient = callPatientInfo[seq];

        await pub.publish(channelName, JSON.stringify(callPatient));
        return true;
      } catch (e) {
        console.log("관리자 목록 조회 실패. seeDidMonitors ==>\n", e);
        throw new Error("관리자 목록 조회에 실패하였습니다.");
      }
    },
  },
};

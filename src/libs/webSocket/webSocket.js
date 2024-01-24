import { Server as IoServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { clients, didClients } from "./clients";
import getInsureData from "./resSocket/getInsureData";

const redis = require("redis");

const prisma = new PrismaClient();

const resConnection = "메디플랫폼 웹소켓 연결 성공.";
const resGetWaitingPatient = "대기환자 정보 수신 성공";
const resCallWaitingPatient = "환자 호출 정보 수신 성공";

const webSocket = async (httpServer) => {
  const sub = redis.createClient();
  const pub = redis.createClient();

  sub.on("error", (err) => {
    console.log("sub on error:", err);
  });

  await sub.connect();
  await pub.connect();

  const socketIo = new IoServer(httpServer, {
    cors: { origin: "*" },
    path: "/mediSocket",
  });

  // const clients = {};

  socketIo.on("connection", async (socket) => {
    socket.emit("resConnection", resConnection);
    console.log(
      "웹 프론트 사용자 연결 완료. 이메일:",
      socket.handshake.query.hospitalEmail,
      "/ 접속 socket Id:",
      socket.id
    );

    // 프론트가 받을 구독 채널이름
    const hospitalChannel = `h-${socket.handshake.query.hospitalEmail}`;
    if (socket.handshake.query.hospitalEmail) {
      clients[hospitalChannel] = clients[hospitalChannel] || {};
      clients[hospitalChannel][socket.id] = socket;

      // 연결되면 환자 정보 요청
      // socket.on("reqWaitingPati", )
    }

    // did모니터용 채널
    let didUniqueId;
    if (socket.handshake.query.didUniqueId) {
      didUniqueId = socket.handshake.query.didUniqueId;

      didClients[didUniqueId] = didClients[didUniqueId] || {};
      didClients[didUniqueId][socket.id] = socket;
    }

    /**각 SendStatus별 socket.on 이벤트 명
     * 1. DID
     * - send : getPatient // 대기환자 정보
     * - call : callPatient // 호출환자 정보
     * - update : updateDid // did 수정
     * - delete: deleteDid // did 삭제
     * - see :
     *   emit - reqSeeDid // did정보 조회 요청
     *   on - resSeeDid // did정보 조회 응답
     *
     * 2. 실손보험(투비콘)
     * - reqInsureData // 진료정보 데이터 요청
     * - getInsureData // 진료정보(실손보험) 데이터 조회(수집)
     */

    // 상태별 데이터 전송 - 병원(did / 실손)
    await sub.subscribe(hospitalChannel, (message, channel) => {
      if (clients[channel] && clients[channel][socket.id]) {
        switch (JSON.parse(message).SendStatus) {
          case "send":
            clients[channel][socket.id].emit("getPatient", message);
            break;
          case "call":
            clients[channel][socket.id].emit("callPatient", message);
            break;
          case "allSaveDid":
            clients[channel][socket.id].emit("allSaveDid", message);
            break;
          case "reqInsureData":
            clients[channel][socket.id].emit("reqInsureData", message);
            break;
          case "alim":
            /**
             * alimType:
             *  "hospitalNotice" // 사내공지 알림
             *  "platformNotice" // 플랫폼 공지 알림
             *  "reservation" // 예약대기 등록 알림
             *  "specialSchedule" // 특별일정 등록 알림
             */
            clients[channel][socket.id].emit("notiAlim", message);
            break;
        }
      }
    });

    // did - 데이터 전송
    if (didUniqueId)
      await sub.subscribe(didUniqueId, (message, channel) => {
        switch (JSON.parse(message).SendStatus) {
          case "update":
            socket.emit("updateDid", message);
            break;
          case "delete":
            socket.emit("deleteDid", message);
            break;
          case "saveDid":
            socket.emit("saveDid", message);
            break;
        }
      });

    // 조회 데이터 요청 및 응답
    socket.on("reqSeeDid", async (did_uniqueId) => {
      const findDid = await prisma.did.findUnique({
        where: { did_uniqueId },
      });
      const did = await prisma.did.findUnique({
        where: { did_id: findDid.did_id },
        include: {
          didDoctorRoom: {
            where: { AND: [{ did_id: findDid.did_id }, { ddr_isDelete: false }] },
            select: {
              ddr_id: true,
              ddr_info: true,
              ddr_dayOff: true,
              ddr_number: true,
              ddr_viewSelect: true,
              ddr_deptCode: true,
              ddr_doctorRoomName: true,
              ddr_doctorName: true,
            },
            orderBy: { ddr_number: "asc" },
          },
          didAttached: {
            where: { AND: [{ did_id: findDid.did_id }, { da_isDelete: false }] },
            select: {
              da_id: true,
              da_url: true,
              da_number: true,
            },
            orderBy: { da_number: "asc" },
          },
          didLowMsg: {
            where: { AND: [{ did_id: findDid.did_id }, { dlm_isDelete: false }] },
            select: {
              dlm_id: true,
              dlm_text: true,
              dlm_number: true,
            },
          },
          hospital: { select: { hsp_name: true } },
        },
      });
      socket.emit("resSeeDid", JSON.stringify(did));
    });

    // did - 대기환자
    socket.on("getWaitingPatiInfo", async (data) => {
      const getPatient = JSON.parse(data);
      // console.log("getPatient:", getPatient);

      if (getPatient) {
        const sendChannel = `h-${getPatient.Email}`;
        await pub.publish(sendChannel, JSON.stringify(getPatient));
      }
      socket.emit("resGetWaitingPatient", resGetWaitingPatient);
    });

    // did - 호출환자
    socket.on("callWaitingPatient", async (data) => {
      const callPatient = JSON.parse(data);
      // console.log("getPatient:", callPatient);

      const sendChannel = `h-${callPatient.Email}`;

      await pub.publish(sendChannel, JSON.stringify(callPatient));
      socket.emit("resCallWaitingPatient", resCallWaitingPatient);
    });

    // insure(실손보험) - 진료 정보 데이터 => api로 변경됨.
    // await getInsureData(socket);

    socket.on("disconnect", async () => {
      // console.log("user disconnected.", socket.id);

      // 웹 클라이언트 소켓제거 확인
      if (socket.handshake.query.hospitalEmail) {
        delete clients[hospitalChannel][socket.id];
        // console.log("disconnect clients:", clients);

        if (Object.keys(clients[hospitalChannel]).length === 0) {
          await sub.unsubscribe(hospitalChannel);
          // console.log(`unsubscribe channel: ${channelName}`);
        }
      }

      if (socket.handshake.query.didUniqueId) {
        delete didClients[didUniqueId][socket.id];

        if (Object.keys(didClients[didUniqueId]).length === 0) {
          // console.log(`unsubscribe did channel: ${didUniqueId}`);
          await sub.unsubscribe(didUniqueId);
        }
      }
    });
  });

  return {
    socketIo,
    sub,
    pub,
  };
};

export default webSocket;

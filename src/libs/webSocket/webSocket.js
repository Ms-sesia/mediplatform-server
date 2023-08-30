import { Server as IoServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import clients from "./clients";

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
    // if (socket.handshake.query.hospitalEmail)
    //   console.log(
    //     "웹 프론트 사용자 연결 완료. 이메일:",
    //     socket.handshake.query.hospitalEmail,
    //     "/ 접속 socket Id:",
    //     socket.id
    //   );
    // else console.log("로컬 클라이언트 사용자 연결 완료. 소켓 id:", socket.id);

    // 프론트가 받을 구독 채널이름
    const channelName = `h-${socket.handshake.query.hospitalEmail}`;

    if (socket.handshake.query.hospitalEmail) {
      clients[channelName] = clients[channelName] || {};
      clients[channelName][socket.id] = socket;
    }

    /**각 SendStatus별 socket.on 이벤트 명
     * send : getPatient // 대기환자 정보
     * call : callPatient // 호출환자 정보
     * update : updateDid // did 수정
     * delete: deleteDid // did 삭제
     * see :
     *  emit - reqSeeDid // did정보 조회 요청
     *  on - resSeeDid // did정보 조회 응답
     */
    // 상태별 데이터 전송
    await sub.subscribe(channelName, (message, channel) => {
      if (clients[channel] && clients[channel][socket.id]) {
        switch (JSON.parse(message).SendStatus) {
          case "send":
            // console.log("send 전송");
            clients[channel][socket.id].emit("getPatient", message);
            break;
          case "call":
            // console.log("call 전송");
            clients[channel][socket.id].emit("callPatient", message);
            break;
          case "update":
            // console.log("update 전송");
            clients[channel][socket.id].emit("updateDid", message);
            break;
          case "delete":
            // console.log("delete 전송");
            clients[channel][socket.id].emit("deleteDid", message);
            break;
        }
      }
    });

    // 조회 데이터 요청 및 응답
    socket.on("reqSeeDid", async (did_id) => {
      // console.log("reqSedDid data:", did_id);
      const did = await prisma.did.findUnique({
        where: { did_id },
        include: {
          didDoctorRoom: {
            where: { did_id },
            select: {
              ddr_id: true,
              ddr_info: true,
              ddr_number: true,
              ddr_deptCode: true,
              ddr_doctorRoomName: true,
              ddr_doctorName: true,
            },
            orderBy: { ddr_number: "asc" },
          },
          didAttached: {
            where: { did_id },
            select: {
              da_id: true,
              da_url: true,
              da_number: true,
            },
            orderBy: { da_number: "asc" },
          },
          didLowMsg: {
            where: { did_id },
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

    // 대기환자
    socket.on("getWaitingPatiInfo", async (data) => {
      const getPatient = JSON.parse(data);
      // console.log("getPatient:", getPatient);

      if (getPatient) {
        const sendChannel = `h-${getPatient.Email}`;
        await pub.publish(sendChannel, JSON.stringify(getPatient));
      }
      socket.emit("resGetWaitingPatient", resGetWaitingPatient);
    });

    // 호출환자
    socket.on("callWaitingPatient", async (data) => {
      const callPatient = JSON.parse(data);
      // console.log("getPatient:", callPatient);

      const sendChannel = `h-${callPatient.Email}`;

      await pub.publish(sendChannel, JSON.stringify(callPatient));
      socket.emit("resCallWaitingPatient", resCallWaitingPatient);
    });

    socket.on("disconnect", async () => {
      // console.log("user disconnected.", socket.id);

      // 웹 클라이언트 소켓제거 확인
      if (socket.handshake.query.hospitalEmail) {
        delete clients[channelName][socket.id];
        // console.log("disconnect clients:", clients);

        if (Object.keys(clients[channelName]).length === 0) {
          await sub.unsubscribe(channelName);
          // console.log(`unsubscribe channel: ${channelName}`);
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

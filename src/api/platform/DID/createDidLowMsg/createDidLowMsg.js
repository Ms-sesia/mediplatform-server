import { PrismaClient } from "@prisma/client";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDidLowMsg: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { did_id, dlm_number, dlm_text } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        const did = await prisma.did.findUnique({ where: { did_id } });

        await prisma.didLowMsg.create({
          data: {
            dlm_creatorName: loginUser.user_name,
            dlm_creatorRank: loginUser.user_rank,
            dlm_creatorId: loginUser.user_id,
            dlm_number,
            dlm_text,
            did: { connect: { did_id } },
          },
        });

        const didForSend = await prisma.did.findUnique({
          where: { did_id },
          include: {
            didDoctorRoom: {
              where: { ddr_isDelete: false },
              select: {
                ddr_id: true,
                ddr_info: true,
                ddr_dayOff: true,
                ddr_number: true,
                ddr_deptCode: true,
                ddr_doctorName: true,
                ddr_doctorRoomName: true,
              },
              orderBy: { ddr_number: "asc" },
            },
            didAttached: {
              where: { da_isDelete: false },
              select: {
                da_id: true,
                da_url: true,
                da_number: true,
              },
              orderBy: { da_number: "asc" },
            },
            didLowMsg: {
              where: { dlm_isDelete: false },
              select: {
                dlm_id: true,
                dlm_text: true,
                dlm_number: true,
              },
            },
          },
        });

        const updateDidInfo = {
          SendStatus: "update", // transmit, update, delete
          did: didForSend,
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        // const channelName = `h-${hospital.hsp_email}`;

        await pub.publish(did.did_uniqueId, JSON.stringify(updateDidInfo));

        return true;
      } catch (e) {
        console.log("did 하단 메세지 등록에 실패. createDidLowMsg", e);
        throw new Error("did 하단 메세지 등록에 실패하였습니다.");
      }
    },
  },
};

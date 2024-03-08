import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteDidMonitor: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { did_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const storagePath = path.join(__dirname, "../../../../../", "didMedia");
        const did = await prisma.did.findUnique({ where: { did_id } });

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        // 작성자가 아니면서 병원 계정도 아님
        if (loginUser.user_id !== did.did_creatorId && hospital.hsp_email !== loginUser.user_email) throw 1;

        const attached = await prisma.didAttached.findMany({ where: { did_id } });

        // attached 파일 삭제
        if (attached.length) {
          for (let i = 0; i < attached.length; i++) {
            const fileName = attached[i].da_url.split("/")[3];
            if (fs.existsSync(`${storagePath}/${fileName}`)) {
              fs.unlinkSync(`${storagePath}/${fileName}`);
            }
          }
        }

        await prisma.didAttached.updateMany({
          where: { did_id },
          data: {
            da_editorId: loginUser.user_id,
            da_editorName: loginUser.user_name,
            da_editorRank: loginUser.user_rank,
            da_isDelete: true,
            da_deleteDate: new Date(),
          },
        });

        await prisma.didDoctorRoom.updateMany({
          where: { did_id },
          data: {
            ddr_editorId: loginUser.user_id,
            ddr_editorName: loginUser.user_name,
            ddr_editorRank: loginUser.user_rank,
            ddr_deleteDate: new Date(),
            ddr_isDelete: true,
          },
        });

        await prisma.didLowMsg.updateMany({
          where: { did_id },
          data: {
            dlm_editorId: loginUser.user_id,
            dlm_editorName: loginUser.user_name,
            dlm_editorRank: loginUser.user_rank,
            dlm_isDelete: true,
            dlm_deleteDate: new Date(),
          },
        });

        await prisma.did.update({
          where: { did_id },
          data: {
            did_editorId: loginUser.user_id,
            did_editorName: loginUser.user_name,
            did_editorRank: loginUser.user_rank,
            did_isDelete: true,
            did_deleteDate: new Date(),
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
                ddr_viewSelect: true,
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
          SendStatus: "delete", // transmit, update, delete
          did: didForSend,
        };
        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        await pub.publish(did.did_uniqueId, JSON.stringify(updateDidInfo));

        return true;
      } catch (e) {
        console.log("DID모니터 삭제 실패. deleteDidMonitor", e);
        throw new Error("DID모니터 삭제에 실패하였습니다.");
      }
    },
  },
};

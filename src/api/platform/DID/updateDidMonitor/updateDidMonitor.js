import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { stringify } from "querystring";
import { today9 } from "../../../../libs/todayCal";
import clients from "../../../../libs/webSocket/clients";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateDidMonitor: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        did_id,
        did_title,
        did_doctorRoomExpression,
        did_standbyPersonExpression,
        did_erColorUsed,
        did_erColor,
        did_holdingColorUsed,
        did_holdingColor,
        did_standbyPersonFontsize,
        did_calledPersonFontsize,
        did_calledTextUsed,
        did_calledVoiceUsed,
        did_monitorType,
        did_doctorRoomIsHorizontal,
        did_mediaType,
        did_resUsed,
        did_transmitType,
        did_resInfoLocation,
        did_monitorRatio,
        did_patExpress1,
        did_patExpRatio1,
        did_patExpress2,
        did_patExpRatio2,
        did_patExpress3,
        did_patExpRatio3,
        did_patExpress4,
        did_patExpRatio4,
        did_lowMsgUsed,
        did_resInfoTime,
        did_resInfoCycle,
        did_doctorRoomMerge,
        did_doctorRoomInfoUpdate,
        did_attached,
        did_deleteAttachedId,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: loginUser.hsp_id } });

        const storagePath = path.join(__dirname, "../../../../../", "didMedia");

        const did = await prisma.did.findUnique({ where: { did_id } });

        if (did_deleteAttachedId.length) {
          for (let i = 0; i < did_deleteAttachedId.length; i++) {
            const deleteDa = await prisma.didAttached.findUnique({
              where: { da_id: did_deleteAttachedId[i] },
              select: { da_url: true },
            });

            const urlFileName = deleteDa.da_url.split("/")[3];
            if (fs.existsSync(`${storagePath}/${urlFileName}`)) {
              fs.unlinkSync(`${storagePath}/${urlFileName}`);
            }

            await prisma.didAttached.update({
              where: { da_id: did_deleteAttachedId[i] },
              data: { da_isDelete: true, da_deleteDate: new Date() },
            });
          }
        }

        await prisma.did.update({
          where: { did_id },
          data: {
            did_editorName: loginUser.user_name,
            did_editorRank: loginUser.user_rank,
            did_editorId: loginUser.user_id,
            did_title: did_title ? did_title : did.did_title,
            did_doctorRoomExpression: did_doctorRoomExpression
              ? did_doctorRoomExpression
              : did.did_doctorRoomExpression,
            did_standbyPersonExpression: did_standbyPersonExpression
              ? did_standbyPersonExpression
              : did.did_standbyPersonExpression,
            did_erColorUsed: did_erColorUsed,
            did_erColor: did_erColor ? did_erColor : did.did_erColor,
            did_holdingColorUsed: did_holdingColorUsed,
            did_holdingColor: did_holdingColor ? did_holdingColor : did.did_holdingColor,
            did_standbyPersonFontsize: did_standbyPersonFontsize
              ? did_standbyPersonFontsize
              : did.did_standbyPersonFontsize,
            did_calledPersonFontsize: did_calledPersonFontsize
              ? did_calledPersonFontsize
              : did.did_calledPersonFontsize,
            did_calledTextUsed: did_calledTextUsed,
            did_calledVoiceUsed: did_calledVoiceUsed,
            did_monitorType: did_monitorType ? did_monitorType : did.did_monitorType,
            did_doctorRoomIsHorizontal: did_doctorRoomIsHorizontal,
            did_mediaType: did_mediaType ? did_mediaType : did.did_mediaType,
            did_resUsed: did_resUsed,
            did_transmitType: did_transmitType ? did_transmitType : did.did_transmitType,
            did_resInfoLocation: did_resInfoLocation ? did_resInfoLocation : did.did_resInfoLocation,
            did_monitorRatio: did_monitorRatio ? did_monitorRatio : did.did_monitorRatio,
            did_patExpress1: did_patExpress1 ? did_patExpress1 : did.did_patExpress1,
            did_patExpRatio1: did_patExpRatio1 ? did_patExpRatio1 : did.did_patExpRatio1,
            did_patExpress2: did_patExpress2 ? did_patExpress2 : did.did_patExpress2,
            did_patExpRatio2: did_patExpRatio2 ? did_patExpRatio2 : did.did_patExpRatio2,
            did_patExpress3: did_patExpress3 ? did_patExpress3 : did.did_patExpress3,
            did_patExpRatio3: did_patExpRatio3 ? did_patExpRatio3 : did.did_patExpRatio3,
            did_patExpress4: did_patExpress4 ? did_patExpress4 : did.did_patExpress4,
            did_patExpRatio4: did_patExpRatio4 ? did_patExpRatio4 : did.did_patExpRatio4,
            did_lowMsgUsed: did_lowMsgUsed,
            did_resInfoTime: did_resInfoTime ? did_resInfoTime : did.did_resInfoTime,
            did_resInfoCycle: did_resInfoCycle ? did_resInfoCycle : did.did_resInfoCycle,
            did_doctorRoomMerge: did_doctorRoomMerge,
          },
        });

        if (did_attached.length) {
          for (let i = 0; i < did_attached.length; i++) {
            if (did_attached[i].da_id === 0) {
              const { createReadStream, filename, encoding, mimetype } = await did_attached[i].da_file;
              const stream = createReadStream();

              const fileRename = `${Date.now()}-${filename}`;

              const writeStream = fs.createWriteStream(`${storagePath}/${fileRename}`);

              stream.pipe(writeStream);

              const fileWritePromise = new Promise((resolve, reject) => {
                writeStream.on("finish", () => {
                  const stats = fs.statSync(`${storagePath}/${fileRename}`);
                  resolve(stats);
                });
                writeStream.on("error", reject);
              });

              const stats = await fileWritePromise;

              await prisma.didAttached.create({
                data: {
                  da_editorId: loginUser.user_id,
                  da_editorName: loginUser.user_name,
                  da_editorRank: loginUser.user_rank,
                  da_number: i + 1,
                  da_url: `${process.env.LOCALSTORAGEADDR}${fileRename}`,
                  da_fileSize: stats.size ? stats.size : 0,
                  da_fileType: mimetype,
                  did: { connect: { did_id: did.did_id } },
                },
              });
            } else {
              await prisma.didAttached.update({
                where: { da_id: did_attached[i].da_id },
                data: {
                  da_editorId: loginUser.user_id,
                  da_editorName: loginUser.user_name,
                  da_editorRank: loginUser.user_rank,
                  da_number: i + 1,
                  did: { connect: { did_id: did.did_id } },
                },
              });
            }
          }
        }

        if (did_doctorRoomInfoUpdate.length) {
          for (let i = 0; i < did_doctorRoomInfoUpdate.length; i++) {
            await prisma.didDoctorRoom.update({
              where: { ddr_id: did_doctorRoomInfoUpdate[i].ddr_id },
              data: {
                ddr_editorId: loginUser.user_id,
                ddr_editorName: loginUser.user_name,
                ddr_editorRank: loginUser.user_rank,
                ddr_viewSelect: did_doctorRoomInfoUpdate[i].ddr_viewSelect,
                ddr_number: did_doctorRoomInfoUpdate[i].ddr_number,
                ddr_dayOff: did_doctorRoomInfoUpdate[i].ddr_dayOff,
              },
            });
          }
        }

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
          SendStatus: "update", // transmit, update, delete
          did: didForSend,
        };

        // 병원(channel)에 접속한 클라이언트(socket)에게만 did수정 정보 전달
        const socketIo = await webSocket();
        const pub = socketIo.pub;

        // const channelName = `h-${hospital.hsp_email}`;
        // const didChannel = "31693396924740kWnm#keV";

        // await pub.publish(channelName, JSON.stringify(updateDidInfo));
        await pub.publish(did.did_uniqueId, JSON.stringify(updateDidInfo));

        return true;
      } catch (e) {
        console.log("did 모니터 설정 변경 실패. updateDidMonitor", e);
        throw new Error("did 모니터 설정 변경에 실패하였습니다.");
      }
    },
  },
};

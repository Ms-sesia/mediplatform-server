import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import getInfobankToken from "../../../../expApi/router/Infobank/getInfobankToken";
import axios from "axios";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateHospital: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        hsp_id,
        hsp_img,
        hsp_name,
        hsp_chief,
        hsp_hospitalNumber,
        hsp_businessNumber,
        hsp_address,
        hsp_detailAddress,
        hsp_medicalDepartment,
        hsp_kakaoChannelId,
        hsp_kakaoChannelUrl,
        hsp_messageTrId,
        hsp_messageSendNum,
      } = args;
      try {
        const storagePath = path.join(__dirname, "../../../../../../", "images");
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        let chatbotSend = 0; // 0: 기본, 1: 새로생성 전달, 2: 업데이트 전달

        const hospital = await prisma.hospital.findUnique({ where: { hsp_id } });

        if (!hospital.hsp_kakaoChannelId) chatbotSend = 1; // 새로 등록
        else {
          // 변경할 id가 있고 기존 id와 다를 때
          if (hsp_kakaoChannelId && hsp_kakaoChannelId !== hospital.hsp_kakaoChannelId) chatbotSend = 2; // 업데이트
        }

        let hspNewImgUrl;
        // 이미지 업로드
        if (hsp_img) {
          const hsp_fileName = hospital.hsp_img.split("/")[3];
          if (hospital.hsp_img) {
            if (fs.existsSync(`${storagePath}/${hsp_fileName}`)) {
              fs.unlinkSync(`${storagePath}/${hsp_fileName}`);
            }
          }

          const { createReadStream, filename, encoding, mimetype } = await hsp_img;
          const stream = createReadStream();

          const fileRename = `${Date.now()}-${filename}`;

          // await stream.pipe(fs.createWriteStream(`${storagePath}/${fileRename}`));
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
          hspNewImgUrl = `${process.env.LOCALSTORAGEADDR}${fileRename}`;
        }

        await prisma.hospital.update({
          where: { hsp_id },
          data: {
            hsp_editorId: loginUser.user_id,
            hsp_editorName: loginUser.user_name,
            hsp_editorRank: loginUser.user_rank,
            hsp_img: hspNewImgUrl,
            hsp_name,
            hsp_chief,
            hsp_hospitalNumber,
            hsp_businessNumber,
            hsp_address,
            hsp_detailAddress,
            hsp_medicalDepartment,
            hsp_kakaoChannelId,
            hsp_kakaoChannelUrl,
            hsp_messageTrId,
            hsp_messageSendNum,
          },
        });

        // 인포뱅크 토큰
        const getToken = (await getInfobankToken()).accessToken;
        let url = "";

        // 생성
        if (chatbotSend === 1) {
          console.log("인포뱅크 챗봇 정보 전달(카카오채널 id, url. 생성!!");
          url =
            process.env.NODE_ENV === "production"
              ? "https://chatbot.infobank.net:7443/chatbot/api/bot-info/bots"
              : "https://devmsg.supersms.co/chatbot/api/bot-info/bots";

          /**
           * channelUrl : 병원에 등록된 카카오 채널 url
           * name: 병원에 등록된 카카오 채널 id
           * careFacilityNumber : 요양기관번호
           * managerEmail : 병원 대표 이메일
           * partnerKey : MDSFT
           */
          const chatbotInfo = {
            channelUrl: hospital.hsp_kakaoChannelUrl,
            name: hospital.hsp_kakaoChannelId,
            careFacilityNumber: hospital.hsp_hospitalNumber,
            managerEmail: hospital.hsp_email,
            partnerKey: process.env.MS_IB_PARTNERKEY,
          };

          await axios.post(url, chatbotInfo, {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Accept: "application/json",
              Authorization: `Bearer ${getToken}`,
            },
          });
        }

        // 수정
        if (chatbotSend === 2) {
          console.log("인포뱅크 챗봇 정보 전달(카카오채널 id, url. 수정!!");
          url =
            process.env.NODE_ENV === "production"
              ? "https://chatbot.infobank.net:7443/chatbot/api/bot-info/bots/update"
              : "https://devmsg.supersms.co/chatbot/api/bot-info/bots/update";

          /**
           * channelUrl : 병원에 등록된 카카오 채널 url
           * name: 병원에 등록된 카카오 채널 id
           * careFacilityNumber : 요양기관번호
           * managerEmail : 병원 대표 이메일
           * partnerKey : MDSFT
           */
          const chatbotInfo = {
            name: hsp_kakaoChannelId,
            channelUrl: hsp_kakaoChannelUrl,
            careFacilityNumber: hospital.hsp_hospitalNumber,
            managerEmail: hospital.hsp_email,
            partnerKey: process.env.MS_IB_PARTNERKEY,
          };

          const updateResult = await axios.put(url, chatbotInfo, {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Accept: "application/json",
              Authorization: `Bearer ${getToken}`,
            },
          });
        }

        return true;
      } catch (e) {
        console.log("병원 정보 수정 실패. updateHospital", e);
        throw new Error("err_00");
      }
    },
  },
};

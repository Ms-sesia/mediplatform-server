import { PrismaClient } from "@prisma/client";
import webSocket from "../../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    resendInsuranceRequest: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ih_id } = args;
      try {
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: user.hospital.hsp_id } });

        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        const ih = await prisma.insuranceHistory.findUnique({ where: { ih_id } });

        const sendData = {
          claimDate: ih.ih_tobeClaimDate,
          date: ih.ih_tobeDate,
          patno: ih.ih_tobePatno,
          unique: ih.ih_tobeUnique,
        };

        const reqInsureData = {
          SendStatus: "reqInsureData",
          company: "tobecon",
          data: sendData,
        };

        const returnPub = await pub.publish(channelName, JSON.stringify(reqInsureData));

        // 요청 성공
        if (returnPub) {
          console.log("재요청 성공. unique:", ih.ih_tobeUnique);
          await prisma.ihText.create({
            data: {
              iht_text: `플랫폼 -> EMR로 데이터를 재요청하였습니다.`,
              insuranceHistory: { connect: { ih_id } },
            },
          });

          await prisma.insuranceHistory.update({
            where: { ih_id },
            data: { ih_status: "processing" },
          });
          //요청 실패
        } else {
          console.log("재요청 실패. unique:", ih.ih_tobeUnique);
          await prisma.ihText.create({
            data: {
              iht_text: `플랫폼 -> EMR로 데이터 재요청에 실패하였습니다.`,
              insuranceHistory: { connect: { ih_id } },
            },
          });
        }

        return true;
      } catch (e) {
        console.log("청구기록 연동 실패 재전송 실패. resendInsuranceRequest", e);
        throw new Error("err_00");
      }
    },
  },
};

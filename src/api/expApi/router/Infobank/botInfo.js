import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    if (!req.body.botId) throw 1;

    const botId = req.body.botId;
    const hospitalNumber = req.body.careFacilityNumber; // 요양기관번호

    const hospital = await prisma.hospital.findFirst({
      where: {
        AND: [{ hsp_chatbotId: botId }, { hsp_hospitalNumber: { equals: hospitalNumber } }, { hsp_isDelete: false }],
      },
      select: {
        hsp_chatbotId: true,
        hsp_hospitalNumber: true,
        hsp_name: true,
        hsp_phone: true,
      },
    });

    const sendData = {
      botId: hospital.hsp_chatbotId,
      careFacilityNumber: hospital.hsp_hospitalNumber,
      hospitalName: hospital.hsp_name,
      phoneNumber: hospital.hsp_phone,
    };

    // // reservationInfo?botId=63d9ef1dbff00749b0c3cb1a!&appUserId=9873281
    // // botId=63d9ef1dbff00749b0c3cb1a!&officeCode=5

    return res.status(200).json(sendData);
  } catch (e) {
    console.log(`Api Error - botInfo : 챗봇 연결정보 전달 에러. ${e}`);
    let message = "병원 정보를 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        message: "botId를 확인해주세요.",
      });

    return res.status(404).json({ message });
  }
});

export default router;

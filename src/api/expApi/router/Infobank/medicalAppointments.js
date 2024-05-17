import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!req.query.botId) throw 1;

    const botId = req.query.botId;

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: botId }, { hsp_isDelete: false }] },
      select: {
        hsp_id: true,
        hsp_name: true,
      },
    });

    if (!hospital) throw 3;

    const queryData = req.query;

    const startTime = new Date(queryData.startTime);
    const endTime = new Date(queryData.endTime);

    const findResCount = await prisma.reservation.findMany({
      where: {
        re_createdAt: { gte: startTime, lte: endTime },
        hsp_id: hospital.hsp_id,
        re_platform: "kakao",
      },
      select: { re_id: true, re_status: true },
    });

    let resCountInfo = {
      requestCount: 0,
      approvalCount: 0,
      cancelCount: 0,
      totalCount: 0,
    };

    let totalCount = 0;
    console.log("findResCount.length:", findResCount.length);
    for (const frc of findResCount) {
      console.log("frc id:", frc.re_id);
      switch (frc.re_status) {
        case "waiting":
          resCountInfo.requestCount++;
          break;
        case "complete": // 완료 상태를 approvalCount 상테에 추가
          resCountInfo.approvalCount++;
          break;
        case "confirm":
          resCountInfo.approvalCount++;
          break;
        case "cancel":
          resCountInfo.cancelCount++;
          break;
      }
      totalCount++;
    }
    resCountInfo.totalCount = totalCount;

    return res.status(200).json(resCountInfo);
  } catch (e) {
    console.log(`Api Error - medical-Appointments : 병원별 예약 건수 조회 에러. ${e}`);
    let message = "병원 별 예약 건수 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        message: "botId를 확인해주세요.",
      });

    return res.status(404).json({ message });
  }
});

export default router;

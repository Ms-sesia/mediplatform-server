import { PrismaClient } from "@prisma/client";
import express from "express";
import { weekdays_eng } from "../../../../libs/todayCal";
import { getDrRoomMin } from "../../../../libs/getSchedule";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  // https://medipftest.platcube.info/api/infobank/chatbot/reservationDate?botId=13d9ef1dbff00749b0c3cb1a&officeCode=5
  // admin@platcube.com chatbot id : 13d9ef1dbff00749b0c3cb1a

  try {
    if (!req.query.botId) throw 1;
    if (!req.query.officeCode) throw 2;
    if (!req.query.date) throw 5;
    if (!req.query.time) throw 6;

    const botId = req.query.botId;
    const deptCode = req.query.officeCode;

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: botId }, { hsp_isDelete: false }] },
    });

    if (!hospital) throw 3;

    const drRoom = await prisma.doctorRoom.findFirst({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { dr_deptCode: deptCode }, { dr_isDelete: false }] },
    });

    if (!drRoom) throw 4;

    const reqDate = new Date(req.query.date);
    const reqDate9 = new Date(reqDate.getFullYear(), reqDate.getMonth(), reqDate.getDate(), 9); // KST(UTC+9) 계산
    const day = weekdays_eng[reqDate9.getDay()]; // 요일 계산
    const schDate = new Date(reqDate9.toISOString().split("T")[0]);

    // 예약 가능한 시간대 계산
    const availableMin = await getDrRoomMin(hospital.hsp_id, drRoom.dr_id, schDate, day, req.query.time);

    // return res.status(200).json({
    //   data: availableMin,
    // });
    return res.status(200).json(availableMin);
  } catch (e) {
    console.log(`Api Error - reservationMinute : 진료예약 가능한 분 전송 에러. ${e}`);
    let errMsg = "진료예약 가능한 분을 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        errMsg: "botId를 확인해주세요.",
      });

    if (e === 2 || e === 4)
      return res.status(400).json({
        errMsg: "진료실 코드를 확인해주세요.",
      });
    if (e === 5)
      return res.status(400).json({
        errMsg: "날짜를 확인해주세요.",
      });
    if (e === 6)
      return res.status(400).json({
        errMsg: "시간을 확인해주세요.",
      });

    return res.status(404).json({
      errMsg: errMsg,
    });
  }
});

export default router;

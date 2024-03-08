import { PrismaClient } from "@prisma/client";
import express from "express";
import { weekdays_eng } from "../../../../libs/todayCal";
import { getHspIsOffDay, getIsDrRoomOffDay } from "../../../../libs/getSchedule";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  // https://medipftest.platcube.info/api/infobank/chatbot/reservationDate?botId=13d9ef1dbff00749b0c3cb1a&officeCode=5
  // admin@platcube.com chatbot id : 13d9ef1dbff00749b0c3cb1a

  try {
    if (!req.query.botId) throw 1;
    if (!req.query.officeCode) throw 2;

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

    let schedule = new Array();
    for (let i = 0; i < 31; i++) {
      const today = new Date(new Date().setDate(new Date().getDate() + i));
      const today9 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9); // KST(UTC+9) 계산
      const day = today9.getDay(); // 요일 계산
      const schDate = new Date(today9.toISOString().split("T")[0]);

      const hspIsOff = await getHspIsOffDay(hospital.hsp_id, schDate, weekdays_eng[day]);
      const drIsOff = await getIsDrRoomOffDay(hospital.hsp_id, drRoom.dr_id, schDate, weekdays_eng[day]);

      const drResAvail = {
        date: today9.toISOString().split("T")[0],
        availableTf: drIsOff ? "F" : hspIsOff ? "F" : "T", // 병원이 휴무가 아니지만 진료실이 휴무면 불가
      };

      schedule.push(drResAvail);
    }

    return res.status(200).json(schedule);
  } catch (e) {
    console.log(`Api Error - reservationDate : 진료 예약 날짜 전송 에러. ${e}`);
    let errMsg = "진료예약 가능한 날짜를 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        errMsg: "botId를 확인해주세요.",
      });

    if (e === 2 || e === 4)
      return res.status(400).json({
        errMsg: "진료실 코드를 확인해주세요.",
      });

    return res.status(404).json({
      errMsg: errMsg,
    });
  }
});

export default router;

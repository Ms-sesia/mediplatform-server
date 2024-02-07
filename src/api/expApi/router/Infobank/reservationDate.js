import { PrismaClient } from "@prisma/client";
import express from "express";
import { weekdays_eng } from "../../../../libs/todayCal";
import { offDayGenerate } from "../../../platform/schedule/seeByDaySchedule/seeByDaySchedule";

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

      // console.log(`${today9.toISOString().split("T")[0]}, day: ${weekdays_eng[day]}`);

      const hspIsOff = await getHspIsOffDay(hospital.hsp_id, schDate, weekdays_eng[day]);
      const drIsOff = await getIsDrRoomOffDay(hospital.hsp_id, drRoom.dr_id, schDate, weekdays_eng[day]);

      const drResAvail = {
        date: today9.toISOString().split("T")[0],
        availableTf: drIsOff ? "F" : hspIsOff ? "F" : "T", // 병원이 휴무가 아니지만 진료실이 휴무면 불가
      };

      schedule.push(drResAvail);
    }

    console.log("dr1: ", schedule);

    return res.status(200).json({
      status: 200,
      message: "진료날짜 조회 성공",
      data: schedule,
    });
  } catch (e) {
    console.log(`Api Error - reservationDate : 진료 예약 날짜 전송 에러. ${e}`);
    let errMsg = "진료예약 가능한 날짜를 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        status: 400,
        message: "botId를 확인해주세요.",
      });

    if (e === 2 || e === 4)
      return res.status(400).json({
        status: 400,
        message: "진료실 코드를 확인해주세요.",
      });

    return res.status(404).json({
      status: 404,
      message: errMsg,
    });
  }
});

export default router;

// 병원 스케쥴 계산
const getHspIsOffDay = async (hsp_id, schDate, DayofWeek) => {
  // 병원 운영 스케쥴
  const hspSchedule = await prisma.defaultSchedule.findMany({
    where: { AND: [{ hsp_id: hsp_id }, { ds_day: DayofWeek }, { ds_isDelete: false }] },
    select: {
      ds_startHour: true,
      ds_startMin: true,
      ds_endHour: true,
      ds_endMin: true,
      ds_lunchBreak: true,
      ds_lbStartHour: true,
      ds_lbStartMin: true,
      ds_lbEndHour: true,
      ds_lbEndMin: true,
    },
  });

  // 일간 휴무
  const hspOffDay = await prisma.hospitalOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { ho_offStartDate: { lte: schDate } },
        { ho_offEndDate: { gte: schDate } },
        { ho_isDelete: false },
      ],
    },
  });

  // 월간 휴무
  const hspMonthOffDay = await prisma.monthOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { fo_startDate: { lte: schDate } },
        { fo_endDate: { gte: schDate } },
        { fo_isDelete: false },
      ],
    },
  });

  // 주간 휴무
  const hspWeekOffDay = await prisma.weekOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { wo_startDate: { lte: schDate } },
        { wo_endDate: { gte: schDate } },
        { wo_isDelete: false },
      ],
    },
  });

  const isOffDay = offDayGenerate(hspOffDay, hspMonthOffDay, hspWeekOffDay);

  let calTotalOfferTime = -1;
  if (isOffDay) {
    if (isOffDay.offStartHour !== 0 && isOffDay.offEndHour !== 0)
      calTotalOfferTime =
        isOffDay.offEndHour * 60 + isOffDay.offEndMin - (isOffDay.offStartHour * 60 + isOffDay.offStartMin);
    else calTotalOfferTime = 0;
  }

  const dsLunchTime = hspSchedule.length
    ? hspSchedule[0].ds_lbEndHour * 60 +
      hspSchedule[0].ds_lbEndMin -
      (hspSchedule[0].ds_lbStartHour * 60 + hspSchedule[0].ds_lbStartMin)
    : 0;
  const dsTotalOperTime = hspSchedule.length
    ? hspSchedule[0].ds_endHour * 60 +
      hspSchedule[0].ds_endMin -
      (hspSchedule[0].ds_startHour * 60 + hspSchedule[0].ds_startMin)
    : 0;

  // 휴무가 아니면 기존계산시간, 휴무면(! -1) 기존 계산시간 - 휴무시간
  const dsOffTotalOperTime = calTotalOfferTime !== -1 ? dsTotalOperTime - calTotalOfferTime : dsTotalOperTime;

  const totalOperTime = hspSchedule.length
    ? calTotalOfferTime !== -1
      ? `${Math.floor(dsOffTotalOperTime / 60)}h ${dsOffTotalOperTime % 60}m`
      : calTotalOfferTime === 0
      ? ""
      : `${Math.floor((dsTotalOperTime - dsLunchTime) / 60)}h ${(dsTotalOperTime - dsLunchTime) % 60}m`
    : "";

  return isOffDay || !totalOperTime ? true : false;
};

// 진료실 스케쥴 계산
const getIsDrRoomOffDay = async (hsp_id, dr_id, schDate, DayofWeek) => {
  const drSchedule = await prisma.doctorRoomSchedule.findMany({
    where: { AND: [{ dr_id }, { drs_isDelete: false }, { drs_day: DayofWeek }] },
  });

  const spSchedule = await prisma.specialSchedule.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { dr_id },
        { ss_isDelete: false },
        { ss_status: "sign" },
        { ss_startDate: { lte: schDate } },
        { ss_endDate: { gte: schDate } },
      ],
    },
  });

  const drsTotalOperTime = drSchedule.length
    ? drSchedule[0].drs_endHour * 60 +
      drSchedule[0].drs_endMin -
      (drSchedule[0].drs_startHour * 60 + drSchedule[0].drs_startMin)
    : 0;

  let calSpOfferTime = -1; // 휴무 계산 기본값
  if (spSchedule) {
    if (spSchedule.ss_startTime !== 0 && spSchedule.ss_endTime !== 0)
      calSpOfferTime =
        parseInt(spSchedule.ss_endTime.split(":")[0]) * 60 +
        parseInt(spSchedule.ss_endTime.split(":")[1]) -
        (parseInt(spSchedule.ss_startTime.split(":")[0]) * 60 + parseInt(spSchedule.ss_startTime.split(":")[1]));
    else calSpOfferTime = 0;
  }

  // 휴무가 아니면 기존계산시간, 휴무면(! -1) 기존 계산시간 - 휴무시간
  const totalOperTime = calSpOfferTime !== -1 ? drsTotalOperTime - calSpOfferTime : drsTotalOperTime;

  // 진료실 일정이 있으면
  // 특별일정이 없으면 false,
  // 특별일정이 있고 일정 휴무이면 휴무 true,
  // 시간 휴무이면 총 근무시간(totalOperTime)이 있으면(0보다 크면) false,
  // 아니면 휴무 true
  // 진료실 일정이 없으면 false
  const isOffDay = drSchedule.length
    ? spSchedule
      ? spSchedule.ss_type === "schedule"
        ? true
        : totalOperTime <= 0
        ? true
        : false
      : false
    : true;

  return isOffDay;
};

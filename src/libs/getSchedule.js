import { PrismaClient } from "@prisma/client";
import { offDayGenerate } from "../api/platform/schedule/seeByDaySchedule/seeByDaySchedule";

const prisma = new PrismaClient();

// 병원 스케쥴 계산
export const getHspIsOffDay = async (hsp_id, schDate, DayofWeek) => {
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

// 진료실 휴무 스케쥴 계산
export const getIsDrRoomOffDay = async (hsp_id, dr_id, schDate, DayofWeek) => {
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

// 진료실 스케쥴 시간 계산
export const getDrRoomHour = async (hsp_id, dr_id, schDate, DayofWeek) => {
  const drRoomTime = await drRoomSche(hsp_id, dr_id, schDate, DayofWeek);
  let availableTimes = new Array();

  // 운영 시간이 존재하지 않는 경우
  const startHour = drRoomTime.startHour === 0 && drRoomTime.endHour === 0 ? 9 : drRoomTime.startHour;
  const endHour = drRoomTime.startHour === 0 && drRoomTime.endHour === 0 ? 18 : drRoomTime.endHour;

  // 의사의 근무 시간대 계산
  for (let hour = startHour; hour < endHour; hour++) {
    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;

    // 점심 시간 및 특별 스케줄 시간 제외
    if (drRoomTime.lunchBreak && hour >= drRoomTime.lbStartHour && hour < drRoomTime.lbEndHour) {
      availableTimes.push({
        time: hour,
        availableTf: "F",
      });
      continue;
    }
    if (drRoomTime.isOffDay && hour >= drRoomTime.offStartHour && hour < drRoomTime.offEndHour) {
      availableTimes.push({
        time: hour,
        availableTf: "F",
      });
      continue;
    }

    const availableTf = drRoomTime.startHour === 0 && drRoomTime.endHour === 0 ? "F" : "T";

    availableTimes.push({
      time: hourStr,
      availableTf,
    });
  }

  return availableTimes;
};

// 해당 시간에 예약가능한 분
export const getDrRoomMin = async (hsp_id, dr_id, schDate, DayofWeek, selectHour) => {
  const hour = Number(selectHour);
  const drRoomTime = await drRoomSche(hsp_id, dr_id, schDate, DayofWeek);
  let availableMinutes = [];

  // 선택된 시간이 정규 근무 시간 및 점심 시간 범위 내에 있는지 확인
  const isWithinWorkHours =
    hour === drRoomTime.startHour ||
    hour === drRoomTime.endHour ||
    (hour > drRoomTime.startHour && hour < drRoomTime.endHour);
  const isLunchTime =
    drRoomTime.lunchBreak &&
    (hour === drRoomTime.lbStartHour ||
      hour === drRoomTime.lbEndHour ||
      (hour > drRoomTime.lbStartHour && hour < drRoomTime.lbEndHour));

  // 특별 스케줄(오프 시간) 확인
  const isOffTime =
    drRoomTime.isOffDay &&
    (hour === drRoomTime.offStartHour ||
      hour === drRoomTime.offEndHour ||
      (hour > drRoomTime.offStartHour && hour < drRoomTime.offEndHour));

  for (let min = 0; min < 60; min += 5) {
    // 정규 근무 시간 및 점심 시간 범위 내의 분 확인
    if (
      isWithinWorkHours &&
      !isLunchTime &&
      !(isOffTime && min >= drRoomTime.offStartMin && min < drRoomTime.offEndMin)
    ) {
      if (
        (hour === drRoomTime.startHour && min < drRoomTime.startMin) ||
        (hour === drRoomTime.endHour && min >= drRoomTime.endMin)
      ) {
        // 시작 분 또는 종료 분을 넘어서는 시간 제외
        availableMinutes.push({
          minute: min,
          availableTf: "F",
        });
        continue;
      }
      if (drRoomTime.lunchBreak && hour === drRoomTime.lbStartHour && min >= drRoomTime.lbStartMin) {
        // 점심 시작 분을 포함하는 시간 F표기
        availableMinutes.push({
          minute: min,
          availableTf: "F",
        });
        continue;
      }
      if (drRoomTime.lunchBreak && hour === drRoomTime.lbEndHour && min < drRoomTime.lbEndMin) {
        // 점심 종료 분 전까지의 시간 F표기
        availableMinutes.push({
          minute: min,
          availableTf: "F",
        });
        continue;
      }
      availableMinutes.push({
        minute: min,
        availableTf: "T",
      });
    } else
      availableMinutes.push({
        minute: min,
        availableTf: "F",
      });
  }

  return availableMinutes;
};

// 진료실 스케쥴 계산
const drRoomSche = async (hsp_id, dr_id, schDate, DayofWeek) => {
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

  return {
    isOffDay: spSchedule ? Boolean(spSchedule) : false,
    offStartHour: spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[0]) : -1,
    offStartMin: spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[1]) : -1,
    offEndHour: spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[0]) : -1,
    offEndMin: spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[1]) : -1,
    startHour: drSchedule.length ? drSchedule[0].drs_startHour : 0,
    startMin: drSchedule.length ? drSchedule[0].drs_startMin : 0,
    endHour: drSchedule.length ? drSchedule[0].drs_endHour : 0,
    endMin: drSchedule.length ? drSchedule[0].drs_endMin : 0,
    lunchBreak: drSchedule.length ? drSchedule[0].drs_lunchBreak : false,
    lbStartHour: drSchedule.length ? drSchedule[0].drs_lbStartHour : 0,
    lbStartMin: drSchedule.length ? drSchedule[0].drs_lbStartMin : 0,
    lbEndHour: drSchedule.length ? drSchedule[0].drs_lbEndHour : 0,
    lbEndMin: drSchedule.length ? drSchedule[0].drs_lbEndMin : 0,
  };
};

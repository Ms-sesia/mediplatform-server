import { PrismaClient } from "@prisma/client";
import { offDayGenerate } from "../api/platform/schedule/seeByDaySchedule/seeByDaySchedule";

const prisma = new PrismaClient();

// 병원 스케쥴 계산
export const getHspIsOffDay = async (hsp_id, schDate, DayofWeek) => {
  // 병원 운영 스케쥴
  const hspSchedule = await prisma.defaultSchedule.findFirst({
    where: { hsp_id: hsp_id, ds_day: DayofWeek, ds_isDelete: false },
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

  const orgSchDate = schDate.toISOString().split("T")[0];
  const splitSchDate = orgSchDate.split("-");
  const contSchDate = new Date(splitSchDate[0], splitSchDate[1] - 1, splitSchDate[2]);

  // 일간 휴무
  const hspOffDay = await prisma.hospitalOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { ho_offStartDate: { lte: contSchDate } },
        { ho_offEndDate: { gte: contSchDate } },
        { ho_isDelete: false },
      ],
    },
  });

  // 월간 휴무
  const hspMonthOffDay = await prisma.monthOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { fo_startDate: { lte: contSchDate } },
        { fo_endDate: { gte: contSchDate } },
        { fo_isDelete: false },
      ],
    },
  });

  // 주간 휴무
  const hspWeekOffDay = await prisma.weekOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { wo_startDate: { lte: contSchDate } },
        { wo_endDate: { gte: contSchDate } },
        { wo_isDelete: false },
      ],
    },
  });

  const isOffDay = offDayGenerate(hspOffDay, hspMonthOffDay, hspWeekOffDay);

  // 기본 운영 값(운영가능)
  let off = true;

  // 운영데이터가 없으면 운영 안함
  if (!hspSchedule) off = false;
  // 휴무일
  else if (isOffDay) {
    // 운영 시작 시간보다 휴무 시작 시간이 작거나 같고, 운영 종료 시간보다 휴무 종료 시간이 크거나 같으면 예약 불가능
    if (isOffDay?.offStartHour <= hspSchedule?.ds_startHour && hspSchedule?.ds_endHour <= isOffDay?.offEndHour)
      off = false;
  }

  const today = new Date();
  const today9 = new Date(new Date().setHours(new Date().getHours() + 9));
  const hour = today.getHours();

  // 오늘 이전이거나, 오늘인데 현재 시간이 운영 종료시간을 지난 경우 예약 불가
  if (schDate.toDateString() <= today9.toDateString() && hspSchedule?.ds_endHour < hour) off = false;

  return off;
};

// 진료실 휴무 스케쥴 계산
export const getIsDrRoomOffDay = async (hsp_id, dr_id, schDate, DayofWeek) => {
  const drSchedule = await prisma.doctorRoomSchedule.findFirst({
    where: { dr_id, drs_isDelete: false, drs_day: DayofWeek, doctorRoom: { hsp_id } },
  });

  const spSchedule = await prisma.specialSchedule.findFirst({
    where: {
      hsp_id: hsp_id,
      dr_id,
      ss_isDelete: false,
      ss_status: "sign",
      ss_startDate: { lte: schDate },
      ss_endDate: { gte: schDate },
    },
  });

  let off = true; // 기본 운영값

  // 운영 일정 없으면 예약 불가
  if (!drSchedule) off = false;
  // 특별 일정
  else if (spSchedule) {
    const spStartHour = Number(spSchedule.ss_startTime.split(":")[0]);
    const spEndHour = Number(spSchedule.ss_endTime.split(":")[0]);
    // 운영 시작 시간보다 특별일정 시작 시간이 작거나 같고, 운영 종료 시간보다 특별일정 종료 시간이 크거나 같으면 예약 불가능
    if (spStartHour <= drSchedule.drs_startHour && drSchedule.drs_endHour <= spEndHour) {
      off = false; // 운영 시간이 특별 일정에 포함되면 예약 불가능
    }
  }

  const today = new Date();
  const today9 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9); // 오늘 날짜 기준으로 오전 9시 객체 생성
  const currentHour = today.getHours(); // 현재 시간

  // 오늘 이전이거나, 오늘인데 현재 시간이 운영 종료 시간을 지난 경우 예약 불가능
  if (
    schDate < today9 ||
    (schDate.toDateString() === today9.toDateString() && drSchedule?.drs_endHour <= currentHour)
  ) {
    off = false;
  }

  return off;
};

export const getDrRoomHour = async (hsp_id, dr_id, schDate, DayofWeek) => {
  const drRoomTime = await drRoomSche(hsp_id, dr_id, schDate, DayofWeek);
  // if (!drRoomTime) throw new Error("Invalid drRoomTime data");

  let availableTimes = [];
  const startHour = drRoomTime.startHour === 0 && drRoomTime.endHour === 0 ? 9 : drRoomTime.startHour;
  const endHour = drRoomTime.startHour === 0 && drRoomTime.endHour === 0 ? 18 : drRoomTime.endHour;

  for (let hour = startHour; hour < endHour; hour++) {
    if (!drRoomTime.isSchedule) {
      availableTimes.push({
        time: hourStr,
        availableTf: "F",
      });
      continue;
    }

    const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
    let isAvailable = true;

    // 점심 시간 확인
    if (drRoomTime.lunchBreak && hour >= drRoomTime.lbStartHour && hour <= drRoomTime.lbEndHour) {
      // 점심 시작과 종료 시간이 같은 시간에 있을 경우
      if (hour === drRoomTime.lbStartHour && hour === drRoomTime.lbEndHour) {
        if (drRoomTime.lbStartMin === 0 && drRoomTime.lbEndMin === 0) isAvailable = false; // 시작, 종료 둘 다 0이면 예약 불가

        // 점심 시작시간과 같은 경우
      } else if (hour === drRoomTime.lbStartHour) {
        if (drRoomTime.lbStartMin === 0) isAvailable = false; // 점심 시작 분이 0 이상이면 예약 불가
      }
    }

    // 특별 스케줄 시간 확인
    if (drRoomTime.isOffDay && drRoomTime.offStartHour <= hour && hour <= drRoomTime.offEndHour) {
      // 휴무 시작 시간, 종료시간 사이(초과, 미만)
      if (drRoomTime.offStartHour < hour && hour < drRoomTime.offEndHour) {
        isAvailable = false; // 초과 미만은 무조건 fasle
      }
      // 휴무 시작 시간과 같은 경우
      else if (hour === drRoomTime.offStartHour) {
        if (drRoomTime.offStartMin === 0) isAvailable = false; // 휴무 시작 분이 0 이상이면 예약 불가
      }
    }

    availableTimes.push({
      time: hourStr,
      availableTf: isAvailable ? "T" : "F",
    });
  }

  return availableTimes;
};

export const getDrRoomMin = async (hsp_id, dr_id, schDate, DayofWeek, selectHour) => {
  const hour = Number(selectHour);
  const drRoomTime = await drRoomSche(hsp_id, dr_id, schDate, DayofWeek);
  let availableMinutes = [];

  // 선택된 시간이 정규 근무 시간 범위 내에 있는지 확인
  const isWithinWorkHours = drRoomTime.startHour <= hour && hour <= drRoomTime.endHour;

  // 시간이 점심시간 안에 있는지 확인
  const isLunchTime =
    drRoomTime.lunchBreak &&
    ((hour === drRoomTime.lbStartHour && drRoomTime.lbStartMin <= 59) ||
      (hour === drRoomTime.lbEndHour && drRoomTime.lbEndMin >= 0) ||
      (drRoomTime.lbStartHour < hour && hour <= drRoomTime.lbEndHour));

  // 특별 스케줄(오프 시간) 확인
  const isOffTime = drRoomTime.isOffDay && drRoomTime.offStartHour <= hour && hour <= drRoomTime.offEndHour;

  for (let min = 0; min < 60; min += 5) {
    let isAvailable = true;
    // 근무시간
    if (isWithinWorkHours) {
      // 근무시간 시작 시간, 종료 시간이 같을 때
      if (drRoomTime.startHour === hour && drRoomTime.endHour === hour) {
        // 분이 시작분 이상, 종료분 미만 불가
        if (drRoomTime.startMin <= min && min < drRoomTime.endMin) {
          isAvailable = false;
        }
      }
      // 시작 시간 같고 시작 분 이하 이거나 종료 시간 같고 종료 분 이상일 때 불가
      else if (
        (drRoomTime.startHour === hour && min < drRoomTime.startMin) ||
        (drRoomTime.endHour === hour && drRoomTime.endMin < min)
      ) {
        isAvailable = false;
      }
      // 점심시간
      if (isLunchTime) {
        // 점심시간, 종료 시간이 같을 때
        if (drRoomTime.lbStartHour === hour && drRoomTime.lbEndHour === hour) {
          // 분이 시작분 이상, 종료분 이하 불가
          if (drRoomTime.lbStartMin <= min && min < drRoomTime.lbEndMin) {
            isAvailable = false;
          }
        }
        // 시작 시간 같고 시작 분 이상 이거나 종료 시간 같고 종료 분 이하일 때 불가
        else if (
          (drRoomTime.lbStartHour === hour && drRoomTime.lbStartMin <= min) ||
          (drRoomTime.lbEndHour === hour && min < drRoomTime.lbEndMin)
        ) {
          isAvailable = false;
        }
      }

      // 휴무시간
      if (isOffTime) {
        // 휴무 시작 시간, 종료 시간이 같을 때
        if (drRoomTime.offStartHour === hour && drRoomTime.offEndHour === hour) {
          // 분이 시작분 이상, 종료분 이하 불가
          if (drRoomTime.offStartMin <= min && min <= drRoomTime.offEndMin) {
            isAvailable = false;
          }
        }
        // 시작 시간 같고 시작 분 이상 이거나 종료 시간 같고 종료 분 이하일 때 불가
        else if (
          (drRoomTime.offStartHour === hour && drRoomTime.offStartMin <= min) ||
          (drRoomTime.offEndHour === hour && min < drRoomTime.offEndMin)
        ) {
          isAvailable = false;
        }
      }
    }
    // 나머지 예약 불가
    else {
      isAvailable = false;
    }

    availableMinutes.push({
      minute: min,
      availableTf: isAvailable ? "T" : "F",
    });
  }

  return availableMinutes;
};

// 진료실 스케쥴 계산
const drRoomSche = async (hsp_id, dr_id, schDate, DayofWeek) => {
  const drSchedule = await prisma.doctorRoomSchedule.findMany({
    where: { AND: [{ dr_id }, { drs_isDelete: false }, { drs_day: DayofWeek }] },
  });

  const orgSchDate = new Date(schDate);
  const splitSchDate = schDate.split("-");
  const contSchDate = new Date(splitSchDate[0], splitSchDate[1] - 1, splitSchDate[2]);

  // 일간 휴무
  const hspOffDay = await prisma.hospitalOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { ho_offStartDate: { lte: contSchDate } },
        { ho_offEndDate: { gte: contSchDate } },
        { ho_isDelete: false },
      ],
    },
  });

  // 월간 휴무
  const hspMonthOffDay = await prisma.monthOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { fo_startDate: { lte: contSchDate } },
        { fo_endDate: { gte: contSchDate } },
        { fo_isDelete: false },
      ],
    },
  });

  // 주간 휴무
  const hspWeekOffDay = await prisma.weekOffday.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { wo_startDate: { lte: contSchDate } },
        { wo_endDate: { gte: contSchDate } },
        { wo_isDelete: false },
      ],
    },
  });

  const isOffDay = offDayGenerate(hspOffDay, hspMonthOffDay, hspWeekOffDay);

  // 진료실 특별 일정
  const spSchedule = await prisma.specialSchedule.findFirst({
    where: {
      AND: [
        { hsp_id: hsp_id },
        { dr_id },
        { ss_isDelete: false },
        { ss_status: "sign" },
        { ss_startDate: { lte: orgSchDate } },
        { ss_endDate: { gte: orgSchDate } },
      ],
    },
  });

  const offDay = {
    isOffDay: isOffDay ? Boolean(isOffDay) : spSchedule ? Boolean(spSchedule) : false,
    offStartHour: isOffDay ? isOffDay.offStartHour : spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[0]) : -1,
    offStartMin: isOffDay ? isOffDay.offStartMin : spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[1]) : -1,
    offEndHour: isOffDay ? isOffDay.offEndHour : spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[0]) : -1,
    offEndMin: isOffDay ? isOffDay.offEndMin : spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[1]) : -1,
  };

  return {
    isSchedule: drSchedule ? true : false,
    ...offDay,
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

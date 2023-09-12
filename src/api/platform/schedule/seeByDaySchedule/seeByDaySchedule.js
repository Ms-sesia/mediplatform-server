import { PrismaClient } from "@prisma/client";
import { weekdays_eng } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByDaySchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { searchDate, searchTerm, orderBy } = args;
      try {
        const schDate = new Date(searchDate);
        const DayofWeek = weekdays_eng[schDate.getDay()];

        let operSchedule = new Array();

        // ================================================================== 병원 스케쥴
        // 병원 운영 스케쥴
        const hspSchedule = await prisma.defaultSchedule.findMany({
          where: { AND: [{ hsp_id: user.hospital.hsp_id }, { ds_day: DayofWeek }, { ds_isDelete: false }] },
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

        const hspOffDay = await prisma.hospitalOffday.findFirst({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { ho_offStartDate: { lte: schDate } },
              { ho_offEndDate: { gte: schDate } },
              { ho_isDelete: false },
            ],
          },
        });

        const hspMonthOffDay = await prisma.monthOffday.findFirst({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { fo_startDate: { lte: schDate } },
              { fo_endDate: { gte: schDate } },
              { fo_isDelete: false },
            ],
          },
        });

        const hspWeekOffDay = await prisma.weekOffday.findFirst({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { wo_startDate: { lte: schDate } },
              { wo_endDate: { gte: schDate } },
              { wo_isDelete: false },
            ],
          },
        });

        const isOffDay = offDayGenerate(hspOffDay, hspMonthOffDay, hspWeekOffDay);

        let calTotalOfferTime = 99;
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

        // 휴무가 아니면 기존계산시간, 휴무면(!99) 기존 계산시간 - 휴무시간
        const dsOffTotalOperTime = calTotalOfferTime !== 99 ? dsTotalOperTime - calTotalOfferTime : dsTotalOperTime;

        operSchedule.push({
          title: "병원 운영 스케쥴",
          isOffDay: isOffDay ? Boolean(isOffDay) : false,
          offStartHour: isOffDay ? isOffDay.offStartHour : 99,
          offStartMin: isOffDay ? isOffDay.offStartMin : 99,
          offEndHour: isOffDay ? isOffDay.offEndHour : 99,
          offEndMin: isOffDay ? isOffDay.offEndMin : 99,
          totalOperTime: hspSchedule.length
            ? calTotalOfferTime !== 99
              ? `${Math.floor(dsOffTotalOperTime / 60)}h ${dsOffTotalOperTime % 60}m`
              : calTotalOfferTime === 0
              ? ""
              : `${Math.floor((dsTotalOperTime - dsLunchTime) / 60)}h ${(dsTotalOperTime - dsLunchTime) % 60}m`
            : "",
          startHour: hspSchedule.length ? hspSchedule[0].ds_startHour : 0,
          startMin: hspSchedule.length ? hspSchedule[0].ds_startMin : 0,
          endHour: hspSchedule.length ? hspSchedule[0].ds_endHour : 0,
          endMin: hspSchedule.length ? hspSchedule[0].ds_endMin : 0,
          lunchBreak: hspSchedule.length ? hspSchedule[0].ds_lunchBreak : false,
          lbStartHour: hspSchedule.length ? hspSchedule[0].ds_lbStartHour : 0,
          lbStartMin: hspSchedule.length ? hspSchedule[0].ds_lbStartMin : 0,
          lbEndHour: hspSchedule.length ? hspSchedule[0].ds_lbEndHour : 0,
          lbEndMin: hspSchedule.length ? hspSchedule[0].ds_lbEndMin : 0,
        });
        // ==================================================================

        // ================================================================== 진료실 스케쥴
        const doctorRoomList = await prisma.doctorRoom.findMany({
          where: {
            AND: [
              { hsp_id: user.hospital.hsp_id },
              { dr_isDelete: false },
              { dr_doctorName: { contains: searchTerm } },
            ],
          },
          select: {
            dr_id: true,
            dr_roomName: true,
            dr_doctorName: true,
          },
          orderBy: { dr_roomName: orderBy },
        });

        const searchHistory = await prisma.searchHistory.findMany({
          where: { user_id: user.user_id },
          select: { sh_text: true },
          take: 10,
          orderBy: { sh_createdAt: "desc" },
        });

        const searchText = searchHistory.map((search) => search.sh_text);
        if (searchTerm && !searchText.includes(searchTerm)) {
          await prisma.searchHistory.create({
            data: {
              sh_text: searchTerm,
              user: { connect: { user_id: user.user_id } },
            },
          });
        }

        // 진료실별 운영 스케쥴
        const drScheduleList = await Promise.all(
          doctorRoomList.map(async (dr) => {
            const drSchedule = await prisma.doctorRoomSchedule.findMany({
              where: { AND: [{ dr_id: dr.dr_id }, { drs_isDelete: false }, { drs_day: DayofWeek }] },
            });

            const spSchedule = await prisma.specialSchedule.findFirst({
              where: {
                AND: [
                  { hsp_id: user.hospital.hsp_id },
                  { dr_id: dr.dr_id },
                  { ss_isDelete: false },
                  { ss_startDate: { lte: schDate } },
                  { ss_endDate: { gte: schDate } },
                ],
              },
            });

            const drsLunchTime = drSchedule.length
              ? drSchedule[0].drs_lbEndHour * 60 +
                drSchedule[0].drs_lbEndMin -
                (drSchedule[0].drs_lbStartHour * 60 + drSchedule[0].drs_lbStartMin)
              : 0;
            const drsTotalOperTime = drSchedule.length
              ? drSchedule[0].drs_endHour * 60 +
                drSchedule[0].drs_endMin -
                (drSchedule[0].drs_startHour * 60 + drSchedule[0].drs_startMin)
              : 0;

            let calSpOfferTime = 99; // 휴무 계산 기본값
            if (spSchedule) {
              if (spSchedule.ss_startTime !== 0 && spSchedule.ss_endTime !== 0)
                calSpOfferTime =
                  parseInt(spSchedule.ss_endTime.split(":")[0]) * 60 +
                  parseInt(spSchedule.ss_endTime.split(":")[1]) -
                  (parseInt(spSchedule.ss_startTime.split(":")[0]) * 60 +
                    parseInt(spSchedule.ss_startTime.split(":")[1]));
              else calSpOfferTime = 0;
            }

            // 휴무가 아니면 기존계산시간, 휴무면(!99) 기존 계산시간 - 휴무시간
            const spOffTotalOperTime = calSpOfferTime !== 99 ? drsTotalOperTime - calSpOfferTime : drsTotalOperTime;

            return {
              title: `${dr.dr_roomName}(${dr.dr_doctorName})`,
              isOffDay: spSchedule ? Boolean(spSchedule) : false,
              offStartHour: spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[0]) : 99,
              offStartMin: spSchedule ? parseInt(spSchedule.ss_startTime.split(":")[1]) : 99,
              offEndHour: spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[0]) : 99,
              offEndMin: spSchedule ? parseInt(spSchedule.ss_endTime.split(":")[1]) : 99,
              totalOperTime:
                calSpOfferTime !== 99
                  ? calSpOfferTime === 0
                    ? ""
                    : `${Math.floor(spOffTotalOperTime / 60)}h ${spOffTotalOperTime % 60}m`
                  : `${Math.floor((drsTotalOperTime - drsLunchTime) / 60)}h ${(drsTotalOperTime - drsLunchTime) % 60}m`,
              // totalOperTime: `${Math.floor((drsTotalOperTime - drsLunchTime) / 60)}h ${
              //   (drsTotalOperTime - drsLunchTime) % 60
              // }m`,
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
          })
        );

        operSchedule.push(...drScheduleList);

        return operSchedule.length ? operSchedule : [];
      } catch (e) {
        console.log("일별 운영 스케쥴 조회 실패. seeByDaySchedule ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

const offDayGenerate = (hspOffDay, monthOffdays, weekOffdays) => {
  let offDays;

  if (hspOffDay)
    offDays = {
      offStartHour: hspOffDay.ho_offStartTime ? parseInt(hspOffDay.ho_offStartTime.split(":")[0]) : 0,
      offStartMin: hspOffDay.ho_offStartTime ? parseInt(hspOffDay.ho_offStartTime.split(":")[1]) : 0,
      offEndHour: hspOffDay.ho_offEndTime ? parseInt(hspOffDay.ho_offEndTime.split(":")[0]) : 0,
      offEndMin: hspOffDay.ho_offEndTime ? parseInt(hspOffDay.ho_offEndTime.split(":")[1]) : 0,
    };

  if (monthOffdays)
    offDays = {
      offStartHour: monthOffdays.fo_startTime ? parseInt(monthOffdays.fo_startTime.split(":")[0]) : 0,
      offStartMin: monthOffdays.fo_startTime ? parseInt(monthOffdays.fo_startTime.split(":")[1]) : 0,
      offEndHour: monthOffdays.fo_endTime ? parseInt(monthOffdays.fo_endTime.split(":")[0]) : 0,
      offEndMin: monthOffdays.fo_endTime ? parseInt(monthOffdays.fo_endTime.split(":")[1]) : 0,
    };

  if (weekOffdays)
    offDays = {
      offStartHour: weekOffdays.wo_startTime ? parseInt(weekOffdays.wo_startTime.split(":")[0]) : 0,
      offStartMin: weekOffdays.wo_startTime ? parseInt(weekOffdays.wo_startTime.split(":")[1]) : 0,
      offEndHour: weekOffdays.wo_endTime ? parseInt(weekOffdays.wo_endTime.split(":")[0]) : 0,
      offEndMin: weekOffdays.wo_endTime ? parseInt(weekOffdays.wo_endTime.split(":")[1]) : 0,
    };

  return offDays;
};

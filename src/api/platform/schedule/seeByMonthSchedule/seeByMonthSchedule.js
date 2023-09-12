import { PrismaClient } from "@prisma/client";
import { weekdays_eng } from "../../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Query: {
    seeByMonthSchedule: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { year, month, searchTerm, orderBy } = args;
      try {
        const startDate = new Date(year, month - 1, 1, 9);
        const endDate = new Date(year, month, 1, 9);
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

        // 일~월 병원 기본 스케쥴
        const dfSch = await Promise.all(
          weekdays_eng.map(async (day) => {
            const hsp_schedule = await prisma.defaultSchedule.findFirst({
              where: { AND: [{ hsp_id: user.hospital.hsp_id }, { ds_isDelete: false }, { ds_day: day }] },
              select: { ds_startHour: true, ds_endHour: true },
            });
            return {
              day,
              startHour: hsp_schedule ? hsp_schedule.ds_startHour : 99,
              endHour: hsp_schedule ? hsp_schedule.ds_endHour : 99,
            };
          })
        );

        // 진료실
        const drList = await prisma.doctorRoom.findMany({
          where: {
            AND: [{ hsp_id: user.hospital.hsp_id }, { dr_isDelete: false }, { dr_roomName: { contains: searchTerm } }],
          },
          select: {
            dr_id: true,
            dr_roomName: true,
            dr_doctorName: true,
          },
          orderBy: { dr_roomName: orderBy },
        });

        let schObj = new Object();
        for (let i = 0; i < drList.length; i++) {
          // 일~월 진료실별 기본 스케쥴
          const drSch = await Promise.all(
            weekdays_eng.map(async (day) => {
              const drs = await prisma.doctorRoomSchedule.findFirst({
                where: { AND: [{ dr_id: drList[i].dr_id }, { drs_isDelete: false }, { drs_day: day }] },
                select: { drs_startHour: true, drs_endHour: true },
              });
              return {
                day,
                startHour: drs ? drs.drs_startHour : 99,
                endHour: drs ? drs.drs_endHour : 99,
              };
            })
          );
          schObj[drList[i].dr_roomName] = drSch;
        }

        // =============================================================== 병원 휴무 구하기
        const hspOffDay = (
          await prisma.hospitalOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { ho_isDelete: false }],
            },
            select: { ho_offStartDate: true, ho_offEndDate: true },
          })
        ).map((hspOffDay) => {
          return {
            startDate: hspOffDay.ho_offStartDate,
            endDate: hspOffDay.ho_offEndDate,
          };
        });

        const hspMonthOffDay = (
          await prisma.monthOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { fo_isDelete: false }],
            },
            select: { fo_startDate: true, fo_endDate: true },
          })
        ).map((monthOffDay) => {
          return {
            startDate: monthOffDay.fo_startDate,
            endDate: monthOffDay.fo_endDate,
          };
        });

        const hspWeekOffDay = (
          await prisma.weekOffday.findMany({
            where: {
              AND: [{ hsp_id: user.hospital.hsp_id }, { wo_isDelete: false }],
            },
            select: { wo_startDate: true, wo_endDate: true },
          })
        ).map((weekOffday) => {
          return {
            startDate: weekOffday.wo_startDate,
            endDate: weekOffday.wo_endDate,
          };
        });

        // 병원 휴무일
        const fixOffDays = generateFixedDays(month, year, hspOffDay, hspMonthOffDay, hspWeekOffDay);

        // =============================================================== 진료실 휴무 구하기
        const drOffDays = {};
        for (let i = 0; i < drList.length; i++) {
          const spSchedule = (
            await prisma.specialSchedule.findMany({
              where: {
                AND: [
                  { dr_id: drList[i].dr_id },
                  {
                    OR: [
                      { ss_startDate: { gte: startDate, lte: endDate } },
                      { ss_endDate: { gte: startDate, lte: endDate } },
                    ],
                  },
                ],
              },
              select: {
                ss_subDoctorUsed: true,
                ss_startDate: true,
                ss_endDate: true,
              },
            })
          ).map((sp) => {
            return {
              subDoctorUsed: sp.ss_subDoctorUsed,
              startDate: sp.ss_startDate,
              endDate: sp.ss_endDate,
            };
          });
          const fixedDays = [];
          // monthOffday 처리
          spSchedule.forEach((offday) => {
            let startDay = offday.startDate.getDate();
            let endDay = offday.endDate.getDate();

            for (let day = startDay; day <= endDay; day++) {
              const date = new Date(year, month - 1, day, 9).getDate();
              fixedDays.push({
                subDoctorUsed: offday.subDoctorUsed,
                date,
              });
            }
          });

          drOffDays[drList[i].dr_roomName] = fixedDays;
        }

        const daysOfMonth = new Date(year, month, 0).getDate();

        const byTitleMonthDateInfo = new Object();
        const hospitalDateInfo = new Array();
        const drDateArr = new Array();
        const drDateObj = new Object();
        let hsp_offCount = 0;

        for (let i = 1; i <= daysOfMonth; i++) {
          const dayOfDate = new Date(year, month - 1, i, 9).getDay();

          const weekOff = dfSch[dayOfDate].startHour === 0 && dfSch[dayOfDate].endHour === 0 ? "off" : "work";
          const specialOff = fixOffDays.indexOf(i) >= 0 ? true : false; // true면 휴일
          if (fixOffDays.indexOf(i) >= 0) hsp_offCount++;

          hospitalDateInfo.push({
            date: i,
            offInfo: specialOff ? "off" : weekOff,
          });

          for (let j = 0; j < drList.length; j++) {
            if (!drDateObj[drList[j].dr_roomName]) drDateObj[drList[j].dr_roomName] = [];
            // 휴무일 인덱스
            const offIndex = drOffDays[drList[j].dr_roomName].findIndex((e) => e.date === i);

            // 주간 일정
            const drOff =
              schObj[drList[j].dr_roomName][dayOfDate].startHour === 0 &&
              schObj[drList[j].dr_roomName][dayOfDate].endHour === 0
                ? "off"
                : "work";

            drDateObj[drList[j].dr_roomName].push(
              offIndex >= 0
                ? {
                    date: i,
                    offInfo: drOffDays[drList[j].dr_roomName][offIndex].subDoctorUsed ? "subDoctor" : "off",
                  }
                : {
                    date: i,
                    offInfo: drOff,
                  }
            );
          }
        }

        const byMonthSchedule = [];
        byMonthSchedule.push({
          title: "병원 운영 스케쥴",
          workdayCount: daysOfMonth - hsp_offCount,
          offDayCount: hsp_offCount,
          subDoctorDayCount: 0,
          byDateInfo: hospitalDateInfo,
        });

        for (let i = 0; i < drList.length; i++) {
          const dr_offCount = drDateObj[drList[i].dr_roomName].filter((ele) => ele["offInfo"] === "off");
          const dr_subCount = drDateObj[drList[i].dr_roomName].filter((ele) => ele["offInfo"] === "subDoctor");

          byMonthSchedule.push({
            title: drList[i].dr_roomName,
            workdayCount: daysOfMonth - dr_offCount.length,
            offDayCount: dr_offCount.length,
            subDoctorDayCount: dr_subCount.length,
            byDateInfo: drDateObj[drList[i].dr_roomName],
          });
        }

        return byMonthSchedule.length ? byMonthSchedule : [];
      } catch (e) {
        console.log("월별 운영 스케쥴 조회 실패. seeByMonthSchedule ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

const generateFixedDays = (month, year, hspOffDay, monthOffdays, weekOffdays) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const fixedDays = [];

  // hspOffDay 처리
  hspOffDay.forEach((offday) => {
    let startDay = offday.startDate.getDate();
    let endDay = offday.endDate.getDate();

    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(year, month - 1, day, 9).getDate();
      fixedDays.push(date);
    }
  });

  // monthOffday 처리
  monthOffdays.forEach((offday) => {
    let startDay = offday.startDate.getDate();
    let endDay = offday.endDate.getDate();

    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(year, month - 1, day, 9).getDate();
      fixedDays.push(date);
    }
  });

  // weekOffday 처리
  weekOffdays.forEach((offday) => {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day, 9).getDate();
      if (date.getDay() >= offday.wo_startDate.getDay() && date.getDay() <= offday.wo_endDate.getDay()) {
        fixedDays.push(date);
      }
    }
  });

  return fixedDays.sort((a, b) => a - b);
};

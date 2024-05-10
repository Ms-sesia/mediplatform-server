import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeReservationPatientDetail: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { re_id } = args;
      try {
        const reservation = await prisma.reservation.findUnique({
          where: { re_id },
          include: {
            patient: {
              include: {
                patientMemo: {
                  where: { prm_isDelete: false },
                  select: {
                    prm_id: true,
                    prm_text: true,
                    prm_createdAt: true,
                    prm_creatorName: true,
                    prm_creatorRank: true,
                    prm_creatorId: true,
                  },
                },
              },
            },
            resAlim: {
              select: {
                ra_type: true,
                ra_time1: true,
                ra_time2: true,
                ra_time3: true,
                ra_time4: true,
                ra_templateId: true,
              },
            },
          },
        });

        if (!reservation)
          return {
            reservationInfo: {},
            resHistoryList: [],
            patientMemoList: [],
          };

        const resHistories = await prisma.reservation.findMany({
          where: {
            AND: [
              { re_patientName: reservation.re_patientName },
              { re_patientCellphone: reservation.re_patientCellphone },
            ],
          },
          select: {
            re_desireDate: true,
            re_desireTime: true,
            re_year: true,
            re_month: true,
            re_date: true,
            re_time: true,
            re_status: true,
            re_oneLineMem: true,
          },
        });

        const resHistoryList = resHistories.map((res) => {
          const resHistoryDate =
            res.re_status === "confirm"
              ? new Date(res.re_year, res.re_month - 1, res.re_date).toISOString()
              : new Date(res.re_desireDate).toISOString();
          return {
            resDate: resHistoryDate,
            resTime: res.re_time,
            resStatus: res.re_status,
            oneLineMemo: res.re_oneLineMem,
          };
        });

        const resDate = new Date(reservation.re_year, reservation.re_month - 1, reservation.re_date).toISOString();
        const desireDate = new Date(reservation.re_desireDate).toISOString();
        const approvalDate = reservation.re_confirmDate ? new Date(reservation.re_confirmDate).toISOString() : "";

        const alimSet = await prisma.resAlim.findUnique({ where: { re_id } });
        const template = alimSet
          ? await prisma.resAlimTemplate.findUnique({ where: { rat_id: alimSet.ra_templateId } })
          : "";

        const drRoom = reservation?.re_doctorRoomId
          ? await prisma.doctorRoom.findUnique({
              where: { dr_id: reservation.re_doctorRoomId },
            })
          : await prisma.doctorRoom.findFirst({
              where: { AND: [{ hsp_id: user.hospital.hsp_id }, { dr_roomName: reservation.re_doctorRoomName }] },
            });

        const resDetail = reservation
          ? {
              re_id: reservation.re_id,
              resDate,
              desireDate,
              desireTime: reservation.re_desireTime,
              time: reservation.re_time,
              patientName: reservation.re_patientName,
              patientCellphone: reservation.re_patientCellphone,
              platform: reservation.re_platform,
              status: reservation.re_status,
              doctorRoomName: reservation.re_doctorRoomName,
              dr_deptCode: drRoom ? drRoom.dr_deptCode : "",
              patientRrn: reservation.re_patientRrn,
              patientChartNumber: reservation.re_chartNumber,
              oneLineMemo: reservation.re_oneLineMem,
              approvalName: reservation.re_confirmUserName,
              approvalDate,
              largeCategory: reservation.re_LCategory,
              smallCategory: reservation.re_SCategory,
              alimType: alimSet?.ra_type ? alimSet.ra_type : "none",
              alimTime1: alimSet?.ra_time1 ? alimSet.ra_time1 : false,
              alimTime2: alimSet?.ra_time2 ? alimSet.ra_time2 : false,
              alimTime3: alimSet?.ra_time3 ? alimSet.ra_time3 : false,
              alimTime4: alimSet?.ra_time4 ? alimSet.ra_time4 : false,
              template: template ? template.rat_text : "",
            }
          : {};

        const patientMemoList = reservation.patient
          ? reservation.patient.patientMemo.length
            ? reservation.patient.patientMemo.map(async (prmMemo) => {
                const memoCreator = await prisma.user.findUnique({ where: { user_id: prmMemo.prm_creatorId } });
                prmMemo.prm_createdAt = new Date(prmMemo.prm_createdAt).toISOString();
                prmMemo.prm_creatorImg = memoCreator.user_img;
                return prmMemo;
              })
            : []
          : [];

        return {
          reservationInfo: resDetail,
          resHistoryList: resHistoryList,
          patientMemoList: patientMemoList,
        };
      } catch (e) {
        console.log("예약정보 상세 조회 실패. seeReservationPatientDetail ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

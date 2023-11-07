import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const resData = req.body;

  const hospital = await prisma.hospital.findUnique({ where: { hsp_email: resData.hsp_email } });

  if (!hospital) {
    return res.status(404).json({
      status: 400,
      message: "병원 이메일에 맞는 정보를 찾을 수 없습니다.",
      data: {},
    });
  }

  const reservations = resData.reservations;

  let failEmrIds = new Array();

  for (let i = 0; i < reservations.length; i++) {
    try {
      /** 미팅 후 데이터 결정하고 진행 */
      const patient = await prisma.patient.findFirst({
        where: { AND: [{ pati_chartNumber: reservations[i].re_chartNumber }, { hsp_id: hospital.hsp_id }] },
      });
      await prisma.reservation.create({
        data: {
          re_emrId: reservations[i].re_emrId,
          re_desireDate: reservations[i].re_desireDate,
          re_desireTime: reservations[i].re_desireTime,
          re_resDate: reservations[i].re_resDate,
          re_time: reservations[i].re_time,
          re_status: reservations[i].re_status,
          re_platform: reservations[i].re_platform,
          re_patientName: reservations[i].re_patientName,
          re_patientRrn: reservations[i].re_patientRrn,
          re_patientCellphone: reservations[i].re_patientCellphone,
          re_chartNumber: reservations[i].re_chartNumber,
          re_LCategory: reservations[i].re_LCategory,
          re_SCategory: reservations[i].re_SCategory,
          re_doctorRoomName: reservations[i].re_doctorRoomName,
          patient: { connect: { pati_id: patient.pati_id } },
          hospital: { connect: { hsp_id: hospital.hsp_id } },
        },
      });

      console.log("route 예약 생성:", reservations[i]);
    } catch (e) {
      console.log(`예약정보 생성 에러. ${e}\n실패 예약정보 환자 차트번호: ${reservations[i].re_chartNumber}`);
      failEmrIds.push(reservations[i].re_emrId);
    }
  }

  return res.status(200).json({
    status: 200,
    message: failEmrIds.length ? "일부 데이터 연동 실패. failEmrIds 참조." : "데이터 연동 성공",
    data: {
      lastResNum: resData.lastResNum,
      failEmrIds,
    },
  });
});

export default router;

import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  let reservation;
  let patient;
  try {
    const newResData = req.body;
    // console.log("route regNewReservation - newResData:", newResData);

    reservation = newResData.reservation;
    if (Object.keys(reservation).length === 0) throw 0;
    const hospitalEmail = reservation.hsp_email;

    const hospital = await prisma.hospital.findUnique({ where: { hsp_email: hospitalEmail } });
    if (!hospital) throw 1; // 병원이 없음

    const checkRes = await prisma.reservation.findMany({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { re_emrId: reservation.re_emrId }] },
    });

    if (checkRes.length) throw 2;

    // 차트번호가 있을 경우
    if (reservation.re_chartNumber) {
      patient = await prisma.patient.findFirst({
        where: { AND: [{ hsp_id: hospital.hsp_id }, { pati_chartNumber: reservation.re_chartNumber }] },
      });
      // 환자 없음
      if (!patient) throw 3;
    }

    const resDate = new Date(reservation.re_resDate);

    const newRes = await prisma.reservation.create({
      data: {
        re_emrId: reservation.re_emrId,
        re_desireDate: reservation.re_desireDate,
        re_desireTime: reservation.re_desireTime,
        re_resDate: reservation.re_resDate,
        re_year: resDate.getFullYear(),
        re_month: resDate.getMonth() + 1,
        re_date: resDate.getDate(),
        re_time: reservation.re_time,
        re_status: reservation.re_status,
        re_platform: reservation.re_platform,
        re_patientName: reservation.re_patientName,
        re_patientRrn: reservation.re_patientRrn,
        re_patientCellphone: reservation.re_patientCellphone,
        re_chartNumber: reservation.re_chartNumber,
        re_LCategory: reservation.re_LCategory,
        re_SCategory: reservation.re_SCategory,
        re_doctorRoomName: reservation.re_doctorRoomName,
        hospital: { connect: { hsp_id: hospital.hsp_id } },
      },
    });

    // 차트번호 있으면 연동
    if (patient)
      await prisma.reservation.update({
        where: { re_id: newRes.re_id },
        data: { patient: { connect: { pati_id: patient.pati_id } } },
      });

    return res.status(200).json({
      status: 200,
      message: "데이터 연동 성공",
      data: {},
    });
  } catch (e) {
    console.log(`Error - regNewReservation : 새 예약정보 연동 생성 에러. ${e}`);
    let errMsg =
      "New reservation integration failed. 데이터 연동에 실패하였습니다. 자세한 사항은 관리자에게 문의해주세요.";
    switch (e) {
      case 0:
        errMsg = "데이터를 확인해주세요.";
        break;
      case 1:
        errMsg = "존재하지 않는 병원입니다. 메일을 확인해주세요.";
        break;
      case 2:
        errMsg = "이미 등록된 예약입니다. 예약정보를 다시 확인해주세요.";
        break;
      case 3:
        errMsg = "차트번호에 맞는 환자정보가 존재하지 않습니다.";
        break;
    }

    return res.status(400).json({
      status: 400,
      message: errMsg,
    });
  }
});

export default router;

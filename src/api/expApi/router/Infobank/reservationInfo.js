import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    if (!req.body.botId) throw 1;

    const botId = req.body.botId;

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: botId }, { hsp_isDelete: false }] },
      select: {
        hsp_chatbotId: true,
        hsp_name: true,
        hsp_hospitalNumber: true,
        hsp_phone: true,
        hsp_address: true,
        hsp_detailAddress: true,
      },
    });

    if (!hospital) throw 3;

    const resDate = new Date(req.body.reservationDate);

    const newRes = await prisma.reservation.create({
      data: {
        re_emrId: reservation.re_emrId,
        re_desireDate: resDate,
        re_desireTime: req.body.reservationTime,
        re_resDate: resDate,
        re_year: resDate.getFullYear(),
        re_month: resDate.getMonth() + 1,
        re_date: resDate.getDate(),
        re_time: req.body.reservationTime,
        re_patientName: req.body.name,
        re_patientRrn: req.body.birthDate,
        re_doctorRoomName: req.body.reservedOfficeName,
        // re_status: reservation.re_status, // 예약 상태는 대기
        re_platform: "kakao",
        re_patientCellphone: req.body.phoneNumber,
        re_reservedTreatment: req.body.reservedTreatment,
        re_proxyReservationYn: req.body.proxyReservationYn === "Y" ? true : false,
        re_requirement: req.body.requirement,
        re_chatbotRegDate: req.body.regDate,
        hospital: { connect: { hsp_id: hospital.hsp_id } },
      },
    });

    // return res.status(200).json({
    //   data: {
    //     reservationNum: newRes.re_id,
    //     botId: hospital.hsp_chatbotId,
    //     appUserId: newRes.re_appUserId,
    //     hospitalName: hospital.hsp_name,
    //     name: newRes.re_patientName,
    //     phoneNumber: newRes.re_patientCellphone,
    //     birthDate: newRes.re_patientRrn,
    //     reservationDate: resDate.toISOString().split("T")[0],
    //     reservationTime: newRes.re_desireTime,
    //     reservedTreatment: newRes.re_reservedTreatment,
    //     reservedOfficeName: newRes.re_doctorRoomName,
    //     reservationStatus: 0,
    //     proxyReservationYn: newRes.re_proxyReservationYn ? "Y" : "F",
    //     requirement: newRes.re_requirement,
    //     regDate: newRes.re_createdAt,
    //   },
    // });
    return res.status(200).json({
      reservationNum: newRes.re_id,
      botId: hospital.hsp_chatbotId,
      appUserId: newRes.re_appUserId,
      hospitalName: hospital.hsp_name,
      name: newRes.re_patientName,
      phoneNumber: newRes.re_patientCellphone,
      birthDate: newRes.re_patientRrn,
      reservationDate: resDate.toISOString().split("T")[0],
      reservationTime: newRes.re_desireTime,
      reservedTreatment: newRes.re_reservedTreatment,
      reservedOfficeName: newRes.re_doctorRoomName,
      reservationStatus: 0,
      proxyReservationYn: newRes.re_proxyReservationYn ? "Y" : "F",
      requirement: newRes.re_requirement,
      regDate: newRes.re_createdAt,
    });
  } catch (e) {
    console.log(`Api Error - reservationInfo : 카카오챗봇 예약정보 등록 에러. ${e}`);
    let errMsg = "카카오챗봇 예약정보 등록에 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        errMsg: "botId를 확인해주세요.",
      });

    return res.status(404).json({ errMsg });
  }
});

export default router;

import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

// 동일 요청 get처리
router.get("/", async (req, res) => {
  try {
    if (!req.query.botId) throw 1;

    const botId = req.query.botId;
    const appUserId = req.query.appUserId;

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: botId }, { hsp_isDelete: false }] },
      select: {
        hsp_id: true,
        hsp_name: true,
      },
    });

    if (!hospital) throw 3;

    // const today = new Date();
    const today9 = new Date(new Date().setHours(new Date().getHours() + 9));

    // 시간에 따라 조회도 필요
    const chatbotResUser = await prisma.reservation.findMany({
      where: {
        AND: [{ hsp_id: hospital.hsp_id }, { re_appUserId: appUserId }, { re_resDate: { gte: today9 } }],
      },
      orderBy: [{ re_desireDate: "asc" }, { re_desireTime: "asc" }],
    });

    const chatbotResUserList = chatbotResUser.map((resUser) => {
      return {
        hospitalName: hospital.hsp_name,
        name: resUser.re_patientName,
        phoneNumber: resUser.re_patientCellphone,
        birthDate: resUser.re_patientRrn,
        reservationDate: new Date(resUser.re_resDate).toISOString().split("T")[0],
        reservationTime: resUser.re_desireTime,
        reservedTreatment: resUser.re_reservedTreatment,
        reservedOfficeName: resUser.re_doctorRoomName,
        reservationStatus:
          resUser.re_status === "waiting"
            ? "0"
            : resUser.re_status === "confirm" || resUser.re_status === "complete"
            ? "1"
            : "2",
        proxyReservationYn: resUser.re_proxyReservationYn ? "Y" : "N",
        requirement: resUser.re_requirement,
        visited: resUser.pati_id ? "new" : "old",
      };
    });

    return res.status(200).json(chatbotResUserList);
  } catch (e) {
    console.log(`Api Error - (get)reservationInfo : 예약 정보 전송 에러. ${e}`);
    let message = "병원 정보를 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        message: "botId를 확인해주세요.",
      });

    return res.status(404).json({ message });
  }
});

// 동일 요청 post처리
router.post("/", async (req, res) => {
  try {
    if (!req.body.botId) throw 1;

    const infoResData = {
      botId: req.body.botId,
      appUserId: req.body.appUserId,
      hospitalName: req.body.hospitalName,
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
      birthDate: req.body.birthDate,
      reservationDate: req.body.reservationDate,
      reservationTime: req.body.reservationTime,
      reservedTreatment: req.body.reservedTreatment,
      reservedOfficeName: req.body.reservedOfficeName,
      reservationStatus: req.body.reservationStatus,
      proxyReservationYn: req.body.proxyReservationYn,
      requirement: req.body.requirement,
      regDate: req.body.regDate,
    };

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: infoResData.botId }, { hsp_isDelete: false }] },
      select: {
        hsp_id: true,
        hsp_name: true,
        hsp_chatbotId: true,
      },
    });

    if (!hospital) throw 3;

    const findPati = await prisma.patient.findFirst({
      where: { hsp_id: hospital.hsp_id, pati_name: infoResData.name, pati_isDelete: false },
      select: { pati_id: true },
    });

    const resInputDate = `${infoResData.reservationDate} ${infoResData.reservationTime}`;

    const resDate = new Date(new Date(resInputDate).setHours(new Date(resInputDate).getHours() + 9));

    const drRoom = await prisma.doctorRoom.findFirst({
      where: {
        dr_roomName: infoResData.reservedOfficeName,
        hsp_id: hospital.hsp_id,
        dr_isDelete: false,
      },
      select: { dr_id: true },
    });

    const chatbotResCreate = await prisma.reservation.create({
      data: {
        re_desireDate: resDate,
        re_desireTime: infoResData.reservationTime,
        re_resDate: resDate,
        re_year: resDate.getFullYear(),
        re_month: resDate.getMonth() + 1,
        re_date: resDate.getDate(),
        re_time: infoResData.reservationTime,
        re_status:
          infoResData.reservationStatus === "1"
            ? "confirm"
            : infoResData.reservationStatus === "2"
            ? "cancel"
            : "waiting",
        re_platform: "kakao",
        re_patientName: infoResData.name,
        re_patientRrn: infoResData.birthDate,
        re_patientCellphone: infoResData.phoneNumber,
        re_doctorRoomName: infoResData.reservedOfficeName,
        re_doctorRoomId: drRoom ? drRoom.dr_id : 0,
        re_appUserId: infoResData.appUserId,
        re_reservedTreatment: infoResData.reservedTreatment,
        re_proxyReservationYn: infoResData.proxyReservationYn === "Y" ? true : false,
        re_requirement: infoResData.requirement,
        re_chatbotRegDate: infoResData.regDate,
        hospital: { connect: { hsp_id: hospital.hsp_id } },
        patient: findPati ? { connect: { pati_id: findPati.pati_id } } : undefined,
      },
    });

    const returnData = {
      reservationNum: chatbotResCreate.re_id.toString(), // 플랫폼 예약 고유 식별 값
      botId: hospital.hsp_chatbotId, // 병원 채널 챗봇 연결 시 발급받는 챗봇 식별 값
      appUserId: chatbotResCreate.re_appUserId, // 카카오 챗봇 사용자 식별 값
      hospitalName: hospital.hsp_name, // 병원 이름
      name: chatbotResCreate.re_patientName, // 환자 이름
      phoneNumber: chatbotResCreate.re_patientCellphone, // 환자 전화번호
      birthDate: chatbotResCreate.re_patientRrn, // 환자 생년월일
      reservationDate: new Date(chatbotResCreate.re_desireDate).toISOString().split("T")[0], // 진료 희망 날짜
      reservationTime: chatbotResCreate.re_desireTime, // 진료 희망 시간
      reservedTreatment: chatbotResCreate.re_reservedTreatment, // 예약 진료 항목
      reservedOfficeName: chatbotResCreate.re_doctorRoomName, // 예약 진료실
      reservationStatus:
        chatbotResCreate.re_status === "waiting" ? "0" : chatbotResCreate.re_status === "confirm" ? "1" : "2", // 예약 상태(0: 접수 / 1: 확정 / 2: 취소)
      proxyReservationYn: chatbotResCreate.re_proxyReservationYn ? "Y" : "N", // 대리 예약 여부(Y: 대리 예약/ N: 본인 예약)
      requirement: chatbotResCreate.re_requirement, // 요청사항
      regDate: chatbotResCreate.re_chatbotRegDate, // 플랫폼 예약 저장 시각
    };

    // botId = 63d9ef1dbff00749b0c3cb1a!
    // appUserId = 9873281

    return res.status(200).json(returnData);
  } catch (e) {
    console.log(`Api Error - (post)reservationInfo : 예약정보 등록 및 정보 전송 에러. ${e}`);
    let message = "병원 정보를 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        message: "botId를 확인해주세요.",
      });

    return res.status(404).json({ message });
  }
});

const convertDate = (inputDate) => {
  // 2000년대를 기준으로 분기 처리가 필요한 경우 추가 로직 적용
  const year = inputDate.substring(0, 2);
  const month = inputDate.substring(2, 4);
  const date = inputDate.substring(4, 6);

  // 1900년대 또는 2000년대를 구분하여 연도를 처리
  const convertedYear =
    parseInt(year) >= 0 && parseInt(year) < 100 ? (parseInt(year) < 70 ? `20${year}` : `19${year}`) : year;

  // yyyy-mm-dd 형식으로 반환
  return `${convertedYear}-${month}-${date}`;
};

export default router;

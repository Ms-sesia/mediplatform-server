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

    const chatbotResUser = await prisma.reservation.findMany({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { re_appUserId: appUserId }] },
      orderBy: [{ re_desireDate: "asc" }, { re_desireTime: "asc" }],
    });

    const chatbotResUserList = chatbotResUser.map((resUser) => {
      return {
        hospitalName: hospital.hsp_name,
        name: resUser.re_patientName,
        phoneNumber: resUser.re_patientCellphone,
        birthDate: convertDate(resUser.re_patientRrn),
        reservationDate: new Date(resUser.re_desireDate).toISOString().split("T")[0],
        reservationTime: resUser.re_desireTime,
        reservedTreatment: resUser.re_reservedTreatment,
        reservedOfficeName: resUser.re_doctorRoomName,
        reservationStatus:
          resUser.re_status === "waiting" && resUser.re_status === "complete"
            ? 0
            : resUser.re_status === "confirm"
            ? 1
            : 2,
        proxyReservationYn: resUser.re_proxyReservationYn ? "Y" : "N",
        requirement: resUser.re_requirement,
        visited: resUser.pati_id ? "new" : "old",
      };
    });

    return res.status(200).json(chatbotResUserList);
  } catch (e) {
    console.log(`Api Error - hospitalInfo : 병워 정보 전송 에러. ${e}`);
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

    const chatbotResUser = await prisma.reservation.findFirst({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { re_appUserId: infoResData.appUserId }] },
      orderBy: { re_createdAt: "desc" },
    });

    const sendData = {
      reservationNum: chatbotResUser.re_id.toString(),
      botId: hospital.hsp_chatbotId,
      appUserId: chatbotResUser.re_appUserId,
      hospitalName: hospital.hsp_name,
      name: chatbotResUser.re_patientName,
      phoneNumber: chatbotResUser.re_patientCellphone,
      birthDate: convertDate(chatbotResUser.re_patientRrn),
      reservationDate: new Date(chatbotResUser.re_desireDate).toISOString().split("T")[0],
      reservationTime: chatbotResUser.re_desireTime,
      reservedTreatment: chatbotResUser.re_reservedTreatment,
      reservedOfficeName: chatbotResUser.re_doctorRoomName,
      reservationStatus:
        chatbotResUser.re_status === "waiting" && chatbotResUser.re_status === "complete"
          ? 0
          : chatbotResUser.re_status === "confirm"
          ? 1
          : 2,
      proxyReservationYn: chatbotResUser.re_proxyReservationYn ? "Y" : "N",
      requirement: chatbotResUser.re_requirement,
      regDate: new Date(chatbotResUser.re_createdAt).toISOString(),
    };

    // botId = 63d9ef1dbff00749b0c3cb1a!
    // appUserId = 9873281

    return res.status(200).json(sendData);
  } catch (e) {
    console.log(`Api Error - hospitalInfo : 병워 정보 전송 에러. ${e}`);
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
  const day = inputDate.substring(4, 6);

  // 1900년대 또는 2000년대를 구분하여 연도를 처리
  const convertedYear =
    parseInt(year) >= 0 && parseInt(year) < 100 ? (parseInt(year) < 70 ? `20${year}` : `19${year}`) : year;

  // yyyy-mm-dd 형식으로 반환
  return `${convertedYear}-${month}-${day}`;
};

export default router;

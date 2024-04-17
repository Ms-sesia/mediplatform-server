import express from "express";
import sendHospital from "./sendHospital";
import sendPatient from "./sendPatient";
import sendReservation from "./sendReservation";
import regNewPatient from "./regNewPatient";
import regNewReservation from "./regNewReservation";
import sendTobeInsureData from "./sendTobeInsureData";
import reservationDate from "./Infobank/reservationDate";
import reservationTime from "./Infobank/reservationTime";
import reservationMinute from "./Infobank/reservationMinute";
import hospitalInfo from "./Infobank/hospitalInfo";
import operationTime from "./Infobank/operationTime";
import office from "./Infobank/office";
import treatments from "./Infobank/treatments";
import reservationInfo from "./Infobank/reservationInfo";
import botInfo from "./Infobank/botInfo";
import medicalAppointments from "./Infobank/medicalAppointments";

const router = express.Router();

router.use("/sendHospital", sendHospital);
router.use("/sendPatient", sendPatient);
router.use("/sendReservation", sendReservation);
router.use("/regNewPatient", regNewPatient);
router.use("/regNewReservation", regNewReservation);
router.use("/sendTobeInsureData", sendTobeInsureData);
router.use("/infobank/chatbot/reservationDate", reservationDate);
router.use("/infobank/chatbot/reservationTime", reservationTime);
router.use("/infobank/chatbot/reservationMinute", reservationMinute);
router.use("/infobank/chatbot/hospitalInfo", hospitalInfo);
router.use("/infobank/chatbot/operationTime", operationTime);
router.use("/infobank/chatbot/office", office);
router.use("/infobank/chatbot/treatments", treatments);
router.use("/infobank/chatbot/reservationInfo", reservationInfo);
router.use("/infobank/chatbot/botInfo", botInfo);
router.use("/infobank/chatbot/medicalappointments", medicalAppointments);

export default router;

// botId = 63d9ef1dbff00749b0c3cb1a!
// appUserId = 9873281

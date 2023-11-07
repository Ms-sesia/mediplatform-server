import express from "express";
import sendHospital from "./sendHospital";
import sendPatient from "./sendPatient";
import sendReservation from "./sendReservation";
import regNewPatient from "./regNewPatient";
import regNewReservation from "./regNewReservation";
import sendTobeInsureData from "./sendTobeInsureData";

const router = express.Router();

router.use("/sendHospital", sendHospital);
router.use("/sendPatient", sendPatient);
router.use("/sendReservation", sendReservation);
router.use("/regNewPatient", regNewPatient);
router.use("/regNewReservation", regNewReservation);
router.use("/sendTobeInsureData", sendTobeInsureData);

export default router;

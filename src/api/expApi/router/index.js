import express from "express";
import sendHospital from "./sendHospital";
import sendPatient from "./sendPatient";
import sendReservation from "./sendReservation";

const router = express.Router();

router.use("/sendHospital", sendHospital);
router.use("/sendPatient", sendPatient);
router.use("/sendReservation", sendReservation);

export default router;

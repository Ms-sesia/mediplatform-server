import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const patiData = req.body;

  const hospital = await prisma.hospital.findUnique({ where: { hsp_email: patiData.hsp_email } });

  const patients = patiData.patients;

  let failChatNum = new Array();
  console.log(patiData);

  for (let i = 0; i < patients.length; i++) {
    try {
      await prisma.patient.create({
        data: {
          pati_chartNumber: patients[i].pati_chartNumber,
          pati_name: patients[i].pati_name,
          pati_rrn: patients[i].pati_rrn,
          pati_cellphone: patients[i].pati_cellphone,
          pati_gender: patients[i].pati_gender === "남자" ? false : true,
          hospital: { connect: { hsp_id: hospital.hsp_id } },
        },
      });

      console.log("환자정보 생성:", patients[i]);
    } catch (e) {
      console.log(`환자정보 연동 생성 에러. ${e}\n실패 환자 차트번호: ${patients[i].pati_chartNumber}`);
      failChatNum.push(patients[i].pati_chartNumber);
    }
  }

  return res.status(200).json({
    status: 200,
    message: failChatNum.length ? "일부 데이터 연동 실패. failChatNum 참조." : "데이터 연동 성공",
    data: {
      lastPatiChartNum: patiData.lastPatiChartNum,
      failChatNum,
    },
  });
});

export default router;

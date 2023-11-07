import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  let patient;

  try {
    const newPatiData = req.body;
    // console.log("route regNewPatient - patiData:", newPatiData);

    patient = newPatiData.patient;
    if (Object.keys(patient).length === 0) throw 0;

    const hospital = await prisma.hospital.findUnique({ where: { hsp_email: patient.hsp_email } });
    if (!hospital) throw 1; // 병원이 없음

    const checkPatient = await prisma.patient.findMany({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { pati_cellphone: { contains: patient.pati_cellphone } }] },
    });
    if (checkPatient.length) throw 2;

    await prisma.patient.create({
      data: {
        pati_chartNumber: patient.pati_chartNumber,
        pati_name: patient.pati_name,
        pati_rrn: patient.pati_rrn,
        pati_cellphone: patient.pati_cellphone,
        pati_gender: patient.pati_gender === "남자" ? false : true,
        hospital: { connect: { hsp_id: hospital.hsp_id } },
      },
    });

    return res.status(200).json({
      status: 200,
      message: "데이터 연동 성공",
      data: {},
    });
  } catch (e) {
    console.log(`Error - regNewPatient : 새 환자정보 연동 생성 에러. ${e}`);
    let errMsg = "New patient integration failed. 데이터 연동에 실패하였습니다. 자세한 사항은 관리자에게 문의해주세요.";
    switch (e) {
      case 0:
        errMsg = "데이터를 확인해주세요.";
        break;
      case 1:
        errMsg = "존재하지 않는 병원입니다. 메일을 확인해주세요.";
        break;
      case 2:
        errMsg = "이미 등록된 환자입니다. 환자정보를 다시 확인해주세요.";
        break;
    }

    return res.status(400).json({
      status: 400,
      message: errMsg,
    });
  }
});

export default router;

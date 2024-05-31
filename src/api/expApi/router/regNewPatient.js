import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  let patient;

  try {
    const patient = req.body;
    console.log("route regNewPatient - patiData:", patient);

    // patient = newPatiData.patient;
    if (Object.keys(patient).length === 0) throw 0;

    const hospital = await prisma.hospital.findUnique({ where: { hsp_email: patient.hsp_email } });
    if (!hospital) throw 1; // 병원이 없음

    const checkPatient = await prisma.patient.findFirst({
      where: { hsp_id: hospital.hsp_id, pati_chartNumber: patient.pati_chartNumber },
    });

    // 있으면 업데이트
    if (checkPatient) {
      // 삭제
      if (patient.pati_delete === "Y") {
        // console.log("patient delete complete.");

        // // 메모 삭제
        // await prisma.patientMemo.deleteMany({ where: { pati_id: checkPatient.pati_id } });

        // // 예약 기록 삭제
        // await prisma.reservation.deleteMany({ where: { pati_id: checkPatient.pati_id } });

        // 환자 정보 삭제
        await prisma.patient.update({
          where: { pati_id: checkPatient.pati_id },
          data: {
            pati_isDelete: true,
            pati_deleteDate: new Date(),
          },
        });

        return res.status(200).json({
          status: 200,
          message: "환자정보가 삭제되었습니다.",
          data: {},
        });
      }
      // console.log("수정");
      await prisma.patient.update({
        where: { pati_id: checkPatient.pati_id },
        data: {
          pati_isDelete: false,
          pati_deleteDate: null,
          pati_chartNumber: patient.pati_chartNumber,
          pati_name: patient.pati_name,
          pati_rrn: patient.pati_rrn,
          pati_cellphone: patient.pati_cellphone,
          pati_gender: patient.pati_gender === "남자" ? false : true,
        },
      });
    } else {
      // 없으면 생성
      // console.log("생성");
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
    }

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

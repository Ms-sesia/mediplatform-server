import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!req.query.botId) throw 1;

    const botId = req.query.botId;
    const deptCode = req.query.officeCode;

    const hospital = await prisma.hospital.findFirst({
      where: { AND: [{ hsp_chatbotId: botId }, { hsp_isDelete: false }] },
      select: {
        hsp_id: true,
        hsp_name: true,
      },
    });

    if (!hospital) throw 3;

    const drs = await prisma.doctorRoom.findMany({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { dr_deptCode: deptCode }] },
      select: { dr_medicalSub: true },
    });

    const medicalSubList = drs.map((dr) => {
      return { treatment: dr.dr_medicalSub };
    });

    // return res.status(200).json({
    //   data: {
    //     hospitalName: hospital.hsp_name,
    //     careFacilityNumber: hospital.hsp_hospitalNumber,
    //     parkingInfo: "",
    //     phoneNumber: hospital.hsp_phone,
    //     address: hospital.hsp_address + hospital.hsp_detailAddress,
    //     Info: "",
    //   },
    // });
    return res.status(200).json(medicalSubList);
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

export default router;

import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const hspData = req.body;
  const hospitalInfo = hspData.hospital;
  const doctorRooms = hspData.doctorRooms;
  console.log("hospital: ", hospitalInfo);
  console.log("doctorRooms: ", doctorRooms);

  const findHospital = await prisma.hospital.findUnique({
    where: { hsp_email: hospitalInfo.hsp_email },
  });

  const hospital = !findHospital
    ? await prisma.hospital.create({
        data: {
          hsp_name: hospitalInfo.hsp_name,
          hsp_chief: hospitalInfo.hsp_chief,
          hsp_hospitalNumber: hospitalInfo.hsp_hospitalNumber,
          hsp_businessNumber: hospitalInfo.hsp_businessNumber,
          hsp_phone: hospitalInfo.hsp_phone,
          hsp_medicalDepartment: hospitalInfo.hsp_medicalDepartment,
          hsp_email: hospitalInfo.hsp_email,
        },
      })
    : findHospital;

  if (doctorRooms.length) {
    doctorRooms.map(async (dr) => {
      await prisma.doctorRoom.create({
        data: {
          dr_deptCode: dr.dr_deptCode,
          dr_roomName: dr.dr_roomName,
          dr_doctorName: dr.dr_doctorName,
          dr_medicalSub: dr.dr_medicalSub,
          hospital: { connect: { hsp_id: hospital.hsp_id } },
        },
      });
    });
  }

  return res.status(200).json({
    status: 200,
    message: "데이터 조회 및 연동 성공",
    // data: hspData,
  });
});

export default router;

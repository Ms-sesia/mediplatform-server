import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const hspData = req.body;
  const hospitalInfo = hspData.hospital;
  const doctorRooms = hspData.doctorRooms;

  let hospital = await prisma.hospital.findUnique({
    where: { hsp_email: hospitalInfo.hsp_email },
  });

  // 병원 정보가 없으면 병원 생성 및 진료실 생성
  if (!hospital) {
    // console.log("병원정보 생성");
    hospital = await prisma.hospital.create({
      data: {
        hsp_name: hospitalInfo.hsp_name,
        hsp_chief: hospitalInfo.hsp_chief,
        hsp_hospitalNumber: hospitalInfo.hsp_hospitalNumber,
        hsp_businessNumber: hospitalInfo.hsp_businessNumber,
        hsp_phone: hospitalInfo.hsp_phone,
        hsp_medicalDepartment: hospitalInfo.hsp_medicalDepartment,
        hsp_email: hospitalInfo.hsp_email,
      },
    });

    // 진료실 생성
    if (doctorRooms.length) await createDrRoom(doctorRooms, hospital.hsp_id);
  } else {
    // console.log("병원정보 업데이트");
    // 병원 정보가 있으면 이메일 제외 업데이트
    hospital = await prisma.hospital.update({
      where: { hsp_id: hospital.hsp_id },
      data: {
        hsp_name: hospitalInfo.hsp_name,
        hsp_chief: hospitalInfo.hsp_chief,
        hsp_hospitalNumber: hospitalInfo.hsp_hospitalNumber,
        hsp_businessNumber: hospitalInfo.hsp_businessNumber,
        hsp_phone: hospitalInfo.hsp_phone,
        hsp_medicalDepartment: hospitalInfo.hsp_medicalDepartment,
      },
    });

    // 병원 정보의 진료실
    const existingDrRooms = await prisma.doctorRoom.findMany({
      where: { AND: [{ hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
    });

    // 진료실 코드 기반으로 맵 생성
    const existingDrRoomsMap = new Map(existingDrRooms.map((drRoom) => [drRoom.dr_deptCode, drRoom]));

    // 신규 및 업데이트 대상 진료실 처리
    for (const drRoom of doctorRooms) {
      if (existingDrRoomsMap.has(drRoom.dr_deptCode)) {
        // console.log("진료실 업데이트. 진료실코드:", drRoom.dr_deptCode);
        // 진료실 업데이트
        await prisma.doctorRoom.updateMany({
          where: { AND: [{ dr_deptCode: drRoom.dr_deptCode }, { hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
          data: {
            dr_roomName: drRoom.dr_roomName,
            dr_doctorName: drRoom.dr_doctorName,
            dr_medicalSub: drRoom.dr_medicalSub,
            hsp_id: hospital.hsp_id,
          },
        });
        // 처리된 진료실은 맵에서 제거
        existingDrRoomsMap.delete(drRoom.dr_deptCode);
      } else {
        // console.log("진료실 새로 생성. 진료실 정보: ", drRoom);
        await prisma.doctorRoom.create({
          data: {
            dr_deptCode: drRoom.dr_deptCode,
            dr_roomName: drRoom.dr_roomName,
            dr_doctorName: drRoom.dr_doctorName,
            dr_medicalSub: drRoom.dr_medicalSub,
            hospital: { connect: { hsp_id: hospital.hsp_id } },
          },
        });
      }
    }

    // 진료실 삭제
    for (const [dr_deptCode] of existingDrRoomsMap) {
      // console.log("삭제 할 진료실코드:", dr_deptCode);
      await prisma.doctorRoom.updateMany({
        where: { AND: [{ dr_deptCode: dr_deptCode }, { hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
        data: {
          dr_isDelete: true,
          dr_deleteDate: new Date(),
        },
      });
    }
  }

  return res.status(200).json({
    status: 200,
    message: "데이터 조회 및 연동 성공",
    // data: hspData,
  });
});

export default router;

// 진료실 생성
const createDrRoom = async (doctorRooms, hsp_id) => {
  doctorRooms.map(async (dr) => {
    await prisma.doctorRoom.create({
      data: {
        dr_deptCode: dr.dr_deptCode,
        dr_roomName: dr.dr_roomName,
        dr_doctorName: dr.dr_doctorName,
        dr_medicalSub: dr.dr_medicalSub,
        hospital: { connect: { hsp_id } },
      },
    });
  });
};

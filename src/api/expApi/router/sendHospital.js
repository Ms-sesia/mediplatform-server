import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.post("/", async (req, res) => {
  const hspData = req.body;
  const hospitalInfo = hspData.hospital;
  const doctorRooms = hspData.doctorRooms;
  try {
    let hospital = await prisma.hospital.findUnique({
      where: { hsp_email: hospitalInfo.hsp_email },
    });

    /** sendHospital
     *  2024/03/21 수정 요청사항
     *  1. 이메일로 등록된 병원이 없는 경우 생성안하고 에러 status로 전송
     *  2. 이메일로 등록된 병원 있는 경우 병원 정보 및 진료실 수정
     *  3. 병원 진료실 스케쥴 받아오는 부분도 확인
     *  4. DID 진료실 수정/삭제 반영되는 부분 확인
     */

    // 병원 정보가 없으면 병원 생성 및 진료실 생성
    if (!hospital) throw "등록된 병원 정보가 없습니다. 병원 이메일을 확인해주세요.";

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
      select: { dr_id: true, dr_roomName: true, dr_deptCode: true },
    });

    // 진료실 코드 기반으로 맵 생성
    const existingDrRoomsMap = new Map(existingDrRooms.map((drRoom) => [drRoom.dr_deptCode, drRoom]));

    // 신규 및 업데이트 대상 진료실 처리
    for (const drRoom of doctorRooms) {
      if (existingDrRoomsMap.has(drRoom.dr_deptCode)) {
        // 기존의 데이터
        const beforeDrRoom = existingDrRoomsMap.get(drRoom.dr_deptCode);

        // 진료실 정보 업데이트
        await prisma.doctorRoom.updateMany({
          where: { AND: [{ dr_deptCode: drRoom.dr_deptCode }, { hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
          data: {
            dr_roomName: drRoom.dr_roomName,
            dr_doctorName: drRoom.dr_doctorName,
            dr_medicalSub: drRoom.dr_medicalSub,
          },
        });

        // did 진료실 정보 업데이트
        await prisma.didDoctorRoom.updateMany({
          where: {
            AND: [{ ddr_deptCode: drRoom.dr_deptCode }, { did: { hsp_id: hospital.hsp_id } }, { ddr_isDelete: false }],
          },
          data: {
            ddr_doctorRoomName: drRoom.dr_roomName,
            ddr_doctorName: drRoom.dr_doctorName,
          },
        });

        // 예약정보에 진료실 업데이트
        await prisma.reservation.updateMany({
          where: { AND: [{ hsp_id: hospital.hsp_id }, { re_doctorRoomName: beforeDrRoom.dr_roomName }] },
          data: {
            re_doctorRoomId: beforeDrRoom.dr_id,
            re_doctorRoomName: drRoom.dr_roomName,
          },
        });

        // 처리된 진료실은 맵에서 제거
        existingDrRoomsMap.delete(drRoom.dr_deptCode);
      } else {
        const createDrRoom = await prisma.doctorRoom.create({
          data: {
            dr_deptCode: drRoom.dr_deptCode,
            dr_roomName: drRoom.dr_roomName,
            dr_doctorName: drRoom.dr_doctorName,
            dr_medicalSub: drRoom.dr_medicalSub,
            hospital: { connect: { hsp_id: hospital.hsp_id } },
          },
        });

        // 생성할 did 진료실의 did목록
        const dids = await prisma.did.findMany({
          where: { AND: [{ hsp_id: hospital.hsp_id }, { did_isDelete: false }] },
        });

        // did 목록에 진료실 새로 생성
        dids.map(async (did) => {
          const latestDdrRoom = await prisma.didDoctorRoom.findFirst({
            where: { AND: [{ did_id: did.did_id }, { ddr_isDelete: false }] },
            orderBy: { ddr_number: "desc" },
          });

          await prisma.didDoctorRoom.create({
            data: {
              ddr_info: `${createDrRoom.dr_roomName} ${createDrRoom.dr_doctorName}`,
              ddr_deptCode: createDrRoom.dr_deptCode,
              ddr_doctorRoomName: createDrRoom.dr_roomName,
              ddr_doctorName: createDrRoom.dr_doctorName,
              ddr_number: latestDdrRoom ? latestDdrRoom.ddr_number + 1 : 1,
              did: { connect: { did_id: did.did_id } },
            },
          });
        });

        // 처리된 진료실은 맵에서 제거
        existingDrRoomsMap.delete(drRoom.dr_deptCode);
      }
    }

    // 진료실 삭제
    for (const [dr_deptCode] of existingDrRoomsMap) {
      await prisma.doctorRoom.updateMany({
        where: { AND: [{ dr_deptCode: dr_deptCode }, { hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
        data: {
          dr_isDelete: true,
          dr_deleteDate: new Date(),
        },
      });
    }

    // 전달받은 doctorRooms의 deptCodes 배열 생성
    const receivedDeptCodes = doctorRooms.map((drRoom) => drRoom.dr_deptCode);

    // 해당 진료실 코드에 대응하는 didDoctorRoom 정보 삭제
    await prisma.didDoctorRoom.updateMany({
      where: {
        AND: [
          { ddr_deptCode: { notIn: receivedDeptCodes } },
          { did: { hsp_id: hospital.hsp_id } },
          { ddr_isDelete: false },
        ],
      },
      data: {
        ddr_isDelete: true,
        ddr_deleteDate: new Date(),
      },
    });

    return res.status(200).json({
      status: 200,
      message: "데이터 조회 및 연동 성공",
    });
  } catch (e) {
    console.log("sendHospital error :", e);
    // 에러 코드 번호 전송
    return res.status(204).json({
      status: 204,
      message: e,
    });
  }
});

export default router;

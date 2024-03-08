import { PrismaClient } from "@prisma/client";
import express from "express";
import sendEmail from "../../../libs/sendEmail";

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

    // const title = "메디플랫폼 가입 안내 메일";
    // const text = `안녕하세요. 메디플랫폼 입니다.<br>
    // 이 메일은 메디플랫폼 이용 병원 등록정보 및 마스터 계정 정보 전달용 메일입니다.<br>
    // <br>
    // 병원 등록 정보는 아래와 같습니다.<br>
    // <br>
    // 병원명 : ${name}<br>
    // 계약시작일 : ${contractStartDate.toISOString().split("T")[0]}<br>
    // 계약종료일 : ${contractEndDate.toISOString().split("T")[0]}<br>
    // 대표자명 : ${chief}<br>
    // 이메일 : ${email}<br>
    // 사용국가 : ${country}<br>
    // 사업자번호 : ${businessNumber}<br>
    // 요양기관번호 : ${hospitalNumber}<br>
    // <br>
    // 생성된 계정의 정보는 아래와 같습니다.<br>
    // <br>
    // 아이디(email) : ${email}<br>
    // 임시비밀번호 : ${tempPw}<br>
    // <br>
    // 로그인 후 비밀번호를 변경하고 사용해주세요.<br>
    // 감사합니다.`;

    // await sendEmail(hospitalInfo.hsp_email, title, text)

    // 진료실 생성
    if (doctorRooms.length) await createDrRoom(doctorRooms, hospital.hsp_id);
  } else {
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
        // 진료실 정보 업데이트
        await prisma.doctorRoom.updateMany({
          where: { AND: [{ dr_deptCode: drRoom.dr_deptCode }, { hsp_id: hospital.hsp_id }, { dr_isDelete: false }] },
          data: {
            dr_roomName: drRoom.dr_roomName,
            dr_doctorName: drRoom.dr_doctorName,
            dr_medicalSub: drRoom.dr_medicalSub,
            hsp_id: hospital.hsp_id,
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

      await prisma.didDoctorRoom.updateMany({
        where: {
          AND: [{ ddr_deptCode: dr_deptCode }, { did: { hsp_id: hospital.hsp_id } }, { ddr_isDelete: false }],
        },
        data: {
          ddr_isDelete: true,
          ddr_deleteDate: new Date(),
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

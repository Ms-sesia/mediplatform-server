import { PrismaClient } from "@prisma/client";
import express from "express";
import multer from "multer";
import path from "path";
import { convEmrToTobeData } from "../../../libs/insure/emrToTobeDataConv";

const prisma = new PrismaClient();

const router = express.Router();

// 파일 저장을 위한 multer 설정
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const storagePath = path.join(__dirname, "../../../../", "insureFiles");
//     cb(null, storagePath); // 파일이 저장될 경로입니다.
//   },
//   filename: function (req, file, cb) {
//     // 파일명 설정
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// 메모리 이용
const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

router.post(
  "/",
  upload.fields([
    { name: "receipt", maxCount: 1 },
    { name: "prescription", maxCount: 1 },
    { name: "detail", maxCount: 1 },
  ]),
  async (req, res) => {
    const emrInsureData = req.body;
    const hospital = await prisma.hospital.findUnique({ where: { hsp_email: emrInsureData.hsp_email } });

    if (!hospital) {
      return res.status(404).json({
        status: 400,
        message: "병원 이메일에 맞는 정보를 찾을 수 없습니다.",
        data: {},
      });
    }

    // const files = req.files;
    const receipt = req.files.receipt[0].buffer;
    const prescription = req.files.prescription[0].buffer;
    const detail = req.files.detail[0].buffer;

    const jsonDetail = JSON.parse(emrInsureData.jsonDetail);

    const tobeData = convEmrToTobeData(jsonDetail);

    const sendType = {
      unique: "",
      jsonDetail: JSON.stringify(tobeData),
      receipt,
      prescription,
      detail,
    };

    console.log("sendType:", sendType);

    return res.status(200).json({
      status: 200,
      message: "데이터 연동 성공",
    });
  }
);

export default router;

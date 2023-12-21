import { PrismaClient } from "@prisma/client";
import axios from "axios";
import express from "express";
import multer from "multer";
import path from "path";
import { convEmrToTobeData } from "../../../libs/insure/emrToTobeDataConv";
import FormData from "form-data";

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
    let formData = new FormData();

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

    const receipt = req.files.receipt ? req.files.receipt[0] : "";
    const prescription = req.files.prescription ? req.files.prescription[0] : "";
    const detail = req.files.detail ? req.files.detail[0] : "";

    const jsonDetail = JSON.parse(emrInsureData.jsonDetail);

    const tobeData = convEmrToTobeData(jsonDetail);

    // formData.append("unique", "21FA05DF-E8CF-47BD-9116-0F9E8F19A5A4");
    formData.append("unique", emrInsureData.unique);
    formData.append("jsonDetail", JSON.stringify(tobeData));

    let sendType;
    if (receipt && prescription && detail) {
      formData.append("receipt", receipt.buffer, receipt.originalname);
      formData.append("prescription", prescription.buffer, prescription.originalname);
      formData.append("detail", detail.buffer, detail.originalname);
    }
    if (receipt && prescription && !detail) {
      formData.append("receipt", receipt.buffer, receipt.originalname);
      formData.append("prescription", prescription.buffer, prescription.originalname);
    }
    if (receipt && !prescription && detail) {
      formData.append("receipt", receipt.buffer, receipt.originalname);
      formData.append("detail", detail.buffer, detail.originalname);
    }
    if (!receipt && prescription && detail) {
      formData.append("prescription", prescription.buffer, prescription.originalname);
      formData.append("detail", detail.buffer, detail.originalname);
    }
    if (!receipt && !prescription && detail) formData.append("detail", detail.buffer, detail.originalname);

    if (!receipt && prescription && !detail)
      formData.append("prescription", prescription.buffer, prescription.originalname);

    if (receipt && !prescription && !detail) formData.append("receipt", receipt.buffer, receipt.originalname);

    const sendUrl = "https://dev.tobecon.io";
    const route = "/api/emr/addition/treatment";

    // console.log("formdata:", formData);

    const sendTobeTreatment = await axios.post(sendUrl + route, formData, {
      headers: { ...formData.getHeaders(), Authorization: "Basic TVMwMDAwMDE6TVMwMDAwMDE=" },
    });

    // console.log("전송 request:", sendTobeTreatment);
    console.log("tobecon전송 결과:", sendTobeTreatment.data);

    return res.status(200).json({
      status: 200,
      message: "데이터 연동 성공",
    });
  }
);

export default router;

const getJsonDetail =
  '{"receiptList":[{"hospitalCd":"medical2","hospitalBizNo":"1068602713","patientNo":"200","visitDt":"2023-11-10","treatCls":"O","startDt":"2023-11-10","endDt":"2023-11-10","deptCd":"13","deptNm":"이비인후과","receiptNo":"95344","billNo":"74771","diseaseGrpNo":"","totalAmt":17320,"insureAmt":0,"patientAmt":17320,"fullPatientAmt":0,"selectMedicalAmt":0,"exceptSelectMedicalAmt":0,"patientTotalAmt":17300,"upperLmtExcdAmt":0,"preAmt":0,"paymentTargetAmt":17300,"discountAmt":0,"discountRmk":"","receivableAmt":0,"receivableRmk":"","realAmt":17300,"surTax":0,"roomNm":"","roomCls":"","insureKindNm":"P05","nightHolidayYn":""}],"receiptItemList":[{"receiptNo":"95344","billNo":"74771","accClsCd":"01","patientAmt":17320,"insureAmt":0,"fullPatientAmt":0,"selectMedicalAmt":0,"exceptSelectMedicalAmt":0,"totalAmt":17320,"patientTotalAmt":17300}],"receiptDetailList":[{"receiptNo":"95344","billNo":"74771","accClsCd":"01","enforceDt":"진찰료","medicalChrg":"20231110","ediCd":"AA154","itemNm":"AA154","unitCost":17320,"itemQnt":1,"itemTmcnt":1,"itemDays":1,"totalAmt":17320,"memo":"","insuTargetCd":"0","insureAmt":0,"patientAmt":17320,"fullPatientAmt":0,"selectMedicalAmt":0,"exceptSelectMedicalAmt":0,"patientTotalAmt":17320}],"diagsList":[{"receiptNo":"95344","diagnosisDt":"20231110","deptCd":"01","deptNm":"내과","doctorLicense":"72121","doctorNm":"이이빈","diagnosisCd":"A099","diagnosisNm":"상세불명 기원의 위장염 및 결장 염","mainDiagnoYn":"Y","surgeryYn":"","endDiagnoYn":"","medicalOpinion":""},{"receiptNo":"95344","diagnosisDt":"20231110","deptCd":"01","deptNm":"내과","doctorLicense":"72121","doctorNm":"이이빈","diagnosisCd":"F329","diagnosisNm":"상세불명의 우울에피소드","mainDiagnoYn":"N","surgeryYn":"","endDiagnoYn":"","medicalOpinion":""}],"phamList":[{"receiptNo":"95344","billNo":"74771","orderDt":"20231110","doseDt":"20231110","doctorLicense":"72121","doctorNm":"이이빈","specialCd":"","medicalChrg":"652100980","ediCd":"652100980","itemNm":"알레그라정30mg(한독약품)","doseRouteCls":"0","itemQnt":0,"itemTmcnt":3,"itemDays":2,"prescriptionNo":"1","paymentPerCd":"0","drugDetail":""},{"receiptNo":"95344","billNo":"74771","orderDt":"20231110","doseDt":"20231110","doctorLicense":"72121","doctorNm":"이이빈","specialCd":"","medicalChrg":"052100060","ediCd":"052100060","itemNm":"에프벡스겔","doseRouteCls":"1","itemQnt":1,"itemTmcnt":1,"itemDays":1,"prescriptionNo":"1","paymentPerCd":"2","drugDetail":""}]}';

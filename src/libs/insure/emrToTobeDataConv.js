export const convEmrToTobeData = (emrData) => {
  const emrReceiptList = emrData.receiptList;
  const emrReceiptItemList = emrData.receiptItemList;
  const emrReceiptDetailList = emrData.receiptDetailList;
  const emrDiagsList = emrData.diagsList;
  const emrPhamList = emrData.phamList;

  const tobeInsureData = new Object();

  // emrReceipt => tobeReceipt
  const tobeReceiptList = emrReceiptList.map((ERL) => {
    return {
      hospitalCd: ERL.yKiho, // 병원코드
      hospitalBizNo: ERL.businessNo, // 병원사업자번호
      patientNo: ERL.chartNo, // 환자번호
      visitDt: ERL.visitDate, // 진료받은일자
      treatCls: ERL.treatType, // O:외래,I:입원,E:응급
      startDt: ERL.treatStartDate, // 입원:입원일자,통원:통원일자
      endDt: ERL.treatEndDate, // 입원:퇴원일자,통원:통원일자
      deptCd: ERL.deptCode, // 진단과목코드
      deptNm: ERL.deptName, // 요양기관에서 사용하는 진료과목명
      receiptNo: ERL.receptionNo, // 4061100 - 환자의 진료접수번호
      billNo: ERL.billNo, // 39582580030 - 진료영수증번호
      diseaseGrpNo: ERL.DRGSickCode, // DRG(포괄수가)일 경우 기재
      totalAmt: ERL.totalAmt, // 급여+비급여
      insureAmt: ERL.insureAmt, // 공단부담금(급여)
      patientAmt: ERL.patientAmt, // 본인부담금(급여)
      fullPatientAmt: ERL.fullPatientAmt, // 전액본인부담계(급여)
      selectMedicalAmt: ERL.selectAmt, // 선택진료료(비급여)
      exceptSelectMedicalAmt: ERL.exceptSelectAmt, // 선택진료료이외(비급여)
      patientTotalAmt: ERL.patientTotalAmt, // 급여(본인+전액본인)+비급여(선택+선택외)
      upperLmtExcdAmt: ERL.upperLimitExcessAmt, // 상한액초과금
      preAmt: ERL.preAmt, // 이미납부한금액
      paymentTargetAmt: ERL.paymentTargetAmt, // 납부할금액
      discountAmt: ERL.discountAmt, // 감면금액의 합계
      discountRmk: ERL.discountReason, // 감면사유
      receivableAmt: ERL.unpaidAmt, // 납부하지않은금액
      receivableRmk: ERL.unpaidReason, //
      realAmt: ERL.paidAmt, // 납부한금액
      surTax: ERL.vatAmt, //
      roomNm: ERL.roomName, // A동201호
      roomCls: ERL.roomTypeCode, // 00:특실, 01 : 1인실, 02 : 2인실 등으로 기재
      insureKindNm: ERL.insuranceCode, // 보험유형코드(H: 건강, I: 산재, S: 자보, M: 의료급여, G: 일반, E: 기타)
      nightHolidayYn: ERL.NightHolidayType, // 0:야간 1:주간 / 5:공휴일, 0:평일 / "":구분없음
    };
  });

  // emrReceiptItem => tobeReceiptItem
  const tobeReceiptItemList = emrReceiptItemList.map((ERIL) => {
    return {
      receiptNo: ERIL.receptionNo, // 4061100 - 환자의 진료접수번호
      billNo: ERIL.billNo, // 39582580030 - 진료영수증번호
      accClsCd: ERIL.treatItemCode, // 진료항목코드(진찰료)
      patientAmt: ERIL.patientAmt, // 본인부담금(급여)
      insureAmt: ERIL.insuranceAmt, // 공단부담금(급여)
      fullPatientAmt: ERIL.fullPatientAmt, // 전액본인부담계(급여)
      selectMedicalAmt: ERIL.selectAmt, // 선택진료료(비급여)
      exceptSelectMedicalAmt: ERIL.exceptSelectAmt, // 선택진료료이외(비급여)
      totalAmt: ERIL.totalAmt, // 급여+비급여
      patientTotalAmt: ERIL.patientTotalAmt, // 급여(본인+전액본인)+비급여(선택+선택외)
    };
  });

  // emrReceiptDetail => tobeReceiptDetail
  const tobeReceiptDetailList = emrReceiptDetailList.map((ERDL) => {
    return {
      receiptNo: ERDL.receptionNo, // 환자의 진료접수번호
      billNo: ERDL.billNo, // 진료영수증번호
      accClsCd: ERDL.treatItemCode, // 진료항목코드(진찰료)
      enforceDt: ERDL.treatItemName, // 시행일자
      medicalChrg: ERDL.treatDate, // 병원이 자체적으로 사용하는 의료수가코드
      ediCd: ERDL.emrCode, // 심평원EDI코드
      itemNm: ERDL.ediCode, // EDI 코드명 또는 병원이 자체적으로 사용하는 의료수가 명칭
      unitCost: ERDL.unitCost, // 품목에 해당하는 단가
      itemQnt: ERDL.dosingAmtOnce, // 1회 투여시 큐로켈정200밀리그램을 1알
      itemTmcnt: ERDL.dosingCntPerDay, // 아침,점심,저녁일 경우 3회
      itemDays: ERDL.dosingDays, // 일주일일 경우 7
      totalAmt: ERDL.totalAmt, // 급여+비급여
      memo: ERDL.dosingMethod, // 메모
      insuTargetCd: ERDL.insuranceType, // 0:급여, 1:비급여, 2:비보험
      insureAmt: ERDL.insuranceAmt, // 공단부담금(급여)
      patientAmt: ERDL.patientAmt, // 본인부담금(급여)
      fullPatientAmt: ERDL.fullPatientAmt, // 전액본인부담계(급여)
      selectMedicalAmt: ERDL.selectAmt, // 선택진료료(비급여)
      exceptSelectMedicalAmt: ERDL.exceptSelectAmt, // 선택진료료이외(비급여)
      patientTotalAmt: ERDL.patientTotalAmt, // 급여(본인+전액본인)+비급여(선택+선택외)
    };
  });

  // emrDiagsList => tobeDiagsList
  const tobeDiagsList = emrDiagsList.map((EDL) => {
    return {
      receiptNo: EDL.receptionNo, // 환자의 진료접수번호
      diagnosisDt: EDL.sickDate, // 진단받은 일자
      deptCd: EDL.deptCode, // 진단과목코드
      deptNm: EDL.deptName, // 요양기관에서 사용하는 진료과목명
      doctorLicense: EDL.doctorLicense, // 의사면허번호
      doctorNm: EDL.doctorNm, // 의사명
      diagnosisCd: EDL.sickCode, // B15.9-한국표준질병분류기호
      diagnosisNm: EDL.sickName, // 간성 혼수가 없는 A형간염
      mainDiagnoYn: EDL.mainSickYN, // Y-주진단, N-주진단아님
      surgeryYn: EDL.surgeryYn, // Y-수술, N-수술없음
      endDiagnoYn: EDL.endSickYn, // Y-초종, N-최종아님
      medicalOpinion: EDL.doctorOpinion, // 의사소견
    };
  });
  // emrPhamList => tobePhamList
  const tobePhamList = emrPhamList.map((EDL) => {
    return {
      receiptNo: EDL.receptionNo, // 4061100 - 환자의 진료접수번호
      billNo: EDL.billNo, // 39582580030 - 진료영수증번호
      orderDt: EDL.treatDate, // 처방전교부일자
      doseDt: EDL.dosingDate, // 외래:처방일자와 동일, 입원의 경우 다를 수 있음
      doctorLicense: EDL.doctorLicense, // 처방의사 면허번호
      doctorNm: EDL.doctorNm, // 처방의사 성명
      specialCd: EDL.specificCode, // 산정특례해당 환자에게 부여된 V코드 (ex) v193
      medicalChrg: EDL.emrCode, // 병원이 자체적으로 사용하는 의료수가코드
      ediCd: EDL.ediCode, // 심평원EDI코드
      itemNm: EDL.itemNm, // EDI 코드명 또는 병원이 자체적으로 사용하는 의료수가 명칭
      doseRouteCls: EDL.dosingType, // 0: 내복, 1: 외용, 2: 주사
      itemQnt: EDL.dosingAmtOnce, // 1회 투여량(복용량)
      itemTmcnt: EDL.dosingCntPerDay, // 일일 투약(투여)횟수
      itemDays: EDL.dosingDays, // 투여(복용) 일수
      prescriptionNo: EDL.prescriptionNo, // 처방전교부번호 전체
      paymentPerCd: EDL.paymentPerCode, // 본인부담율구분코드(A,B,U,D,V,W) [주5 본인부담율코드]
      drugDetail: EDL.dosingMethod, // 용법설명
    };
  });

  tobeInsureData.tobeReceiptList = tobeReceiptList;
  tobeInsureData.tobeReceiptItemList = tobeReceiptItemList;
  tobeInsureData.tobeReceiptDetailList = tobeReceiptDetailList;
  tobeInsureData.tobeDiagsList = tobeDiagsList;
  tobeInsureData.tobePhamList = tobePhamList;

  console.log();

  return tobeInsureData;
};

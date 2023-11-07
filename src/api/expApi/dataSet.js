// 병원 정보 - 첫 연동
const sendHospital = {
  hospital: {
    hsp_name: "병원 이름",
    hsp_chief: "병원 대표자명",
    hsp_hospitalNumber: "요양기관번호",
    hsp_businessNumber: "사업자번호",
    hsp_phone: "병원 전화번호",
    hsp_medicalDepartment: "진료과목",
    hsp_email: "대표 이메일",
  },
  doctorRooms: {
    dr_deptCode: "진료실 코드",
    dr_roomName: "진료실 이름",
    dr_doctorName: "진료실 의사 이름",
    dr_medicalSub: "진료과목",
  },
  // 대분류 - 소분류 필요?
};

// 환자 정보 - 첫 연동
const patients = {
  lastPatiChartNum: "전송한 마지막 환자 번호(숫자) 1000개씩 예상",
  hsp_email: "병원 이메일",
  patients: {
    pati_chartNumber: "환자 이름",
    pati_name: "환자 주민번호(생년월일)",
    pati_rrn: "환자 휴대폰번호",
    pati_cellphone: "환자 차트번호(키값)",
    pati_gender: "성별",
  },
};

// 예약 정보 - 첫 연동
const reservations = {
  lastResNum: "전송한 마지막 예약 번호(숫자) 1000개씩 예상",
  hsp_email: "병원 이메일",
  reservation: {
    re_emrId: "emr의 예약 id",
    re_desireDate: "예약 희망일",
    re_desireTime: "예약 희망시간. Ex) 10:30",
    re_resDate: "예약 일자",
    re_time: "예약 시간. Ex) 09:30",
    re_status: "예약 상태 ",
    re_platform: "예약 매체",
    re_patientName: "예약자(환자) 이름",
    re_patientRrn: "예약자(환자) 주민번호. Ex) 871012-1",
    re_patientCellphone: "예약자(환자) 휴대폰번호",
    re_chartNumber: "환자 차트번호(키값)",
    re_LCategory: "예약구분 – 대분류",
    re_SCategory: "예약구분 – 소분류",
    re_doctorRoomName: "진료실 이름",
  },
};

// 환자정보
const patient = {
  hsp_email: "병원 이메일",
  pati_chartNumber: "환자 이름",
  pati_name: "환자 주민번호(생년월일)",
  pati_rrn: "환자 휴대폰번호",
  pati_cellphone: "환자 차트번호(키값)",
  pati_gender: "성별",
};

// 예약 정보
const reservation = {
  hsp_email: "병원 이메일",
  re_emrId: "emr의 예약 id",
  re_desireDate: "예약 희망일",
  re_desireTime: "예약 희망시간. Ex) 10:30",
  re_resDate: "예약 일자",
  re_time: "예약 시간. Ex) 09:30",
  re_status: "예약 상태 ", // waiting : 대기,  complete : 완료,  confirm : 확정,  cancel : 취소,  "re_platform": "예약 매체",
  re_patientName: "예약자(환자) 이름",
  re_patientRrn: "예약자(환자) 주민번호. Ex) 871012-1",
  re_patientCellphone: "예약자(환자) 휴대폰번호",
  re_chartNumber: "환자 차트번호(키값)",
  re_LCategory: "예약구분 – 대분류",
  re_SCategory: "예약구분 – 소분류",
  re_doctorRoomName: "진료실 이름",
};

// 투비콘 dataset
const tobeInsureData = {
  "hsp_email": "", // 병원 구분 이메일
  "unique": "", // 환자 unique값 - 투비콘 발행 값
  // jsonDetail: 
  "receiptList": [
    // 영수증 정보
    {
      "yKiho": "", // 병원코드
      "businessNo": "", // 병원사업자번호
      "chartNo": "", // 환자번호
      "visitDate": "", // 진료받은일자
      "treatType": "", // O:외래,I:입원,E:응급
      "treatStartDate": "", // 입원:입원일자,통원:통원일자
      "treatEndDate": "", // 입원:퇴원일자,통원:통원일자
      "deptCode": "", // 진단과목코드
      "deptName": "", // 요양기관에서 사용하는 진료과목명
      "receptionNo": "", // 4061100 - 환자의 진료접수번호
      "billNo": "", // 39582580030 - 진료영수증번호
      "DRGSickCode": "", // DRG(포괄수가)일 경우 기재
      "totalAmt": "", // 급여+비급여
      "insureAmt": "", // 공단부담금(급여)
      "patientAmt": "", // 본인부담금(급여)
      "fullPatientAmt": "", // 전액본인부담계(급여)
      "selectAmt": "", // 선택진료료(비급여)
      "exceptSelectAmt": "", // 선택진료료이외(비급여)
      "patientTotalAmt": "", // 급여(본인+전액본인)+비급여(선택+선택외)
      "upperLimitExcessAmt": "", // 상한액초과금
      "preAmt": "", // 이미납부한금액
      "paymentTargetAmt": "", // 납부할금액
      "discountAmt": "", // 감면금액의 합계
      "discountReason": "", // 감면사유
      "unpaidAmt": "", // 납부하지않은금액
      "unpaidReason": "", //
      "paidAmt": "", // 납부한금액
      "vatAmt": "", //
      "roomName": "", // A동201호
      "roomTypeCode": "", // 00:특실, 01 : 1인실, 02 : 2인실 등으로 기재
      "insuranceCode": "", // 보험유형코드(H: 건강, I: 산재, S: 자보, M: 의료급여, G: 일반, E: 기타)
      "NightHolidayType": "", // 0:야간 1:주간 / 5:공휴일, 0:평일 / "":구분없음
    },
  ],
  "receiptItemList": [
    // 영수증 항목별 내역
    {
      "receptionNo": "", // 4061100 - 환자의 진료접수번호
      "billNo": "", // 39582580030 - 진료영수증번호
      "treatItemCode": "", // 진료항목코드(진찰료)
      "patientAmt": "", // 본인부담금(급여)
      "insuranceAmt": "", // 공단부담금(급여)
      "fullPatientAmt": "", // 전액본인부담계(급여)
      "selectAmt": "", // 선택진료료(비급여)
      "exceptSelectAmt": "", // 선택진료료이외(비급여)
      "totalAmt": "", // 급여+비급여
      "patientTotalAmt": "", // 급여(본인+전액본인)+비급여(선택+선택외)
    },
  ],
  "receiptDetailList": [
    // 진료비 세부내역
    {
      "receptionNo": "", // 환자의 진료접수번호
      "billNo": "", // 진료영수증번호
      "treatItemCode": "", // 진료항목코드(진찰료)
      "treatItemName": "", // 시행일자
      "treatDate": "", // 병원이 자체적으로 사용하는 의료수가코드
      "emrCode": "", // 심평원EDI코드
      "ediCode": "", // EDI 코드명 또는 병원이 자체적으로 사용하는 의료수가 명칭
      "unitCost": "", // 품목에 해당하는 단가
      "dosingAmtOnce": "", // 1회 투여시 큐로켈정200밀리그램을 1알
      "dosingCntPerDay": "", // 아침,점심,저녁일 경우 3회
      "dosingDays": "", // 일주일일 경우 7
      "totalAmt": "", // 급여+비급여
      "dosingMethod": "", // 메모
      "insuranceType": "", // 0:급여, 1:비급여, 2:비보험
      "insuranceAmt": "", // 공단부담금(급여)
      "patientAmt": "", // 본인부담금(급여)
      "fullPatientAmt": "", // 전액본인부담계(급여)
      "selectAmt": "", // 선택진료료(비급여)
      "exceptSelectAmt": "", // 선택진료료이외(비급여)
      "patientTotalAmt": "", // 급여(본인+전액본인)+비급여(선택+선택외)
    },
  ],
  "diagsList": [
    // 진단내역
    {
      "receptionNo": "", // 환자의 진료접수번호
      "sickDate": "", // 진단받은 일자
      "deptCode": "", // 진단과목코드
      "deptName": "", // 요양기관에서 사용하는 진료과목명
      "doctorLicense": "", // 의사면허번호
      "doctorNm": "", // 의사명
      "sickCode": "", // B15.9-한국표준질병분류기호
      "sickName": "", // 간성 혼수가 없는 A형간염
      "mainSickYN": "", // Y-주진단, N-주진단아님
      "surgeryYn": "", // Y-수술, N-수술없음
      "endSickYn": "", // Y-초종, N-최종아님
      "doctorOpinion": "", // 의사소견
    },
  ],
  "phamList": [
    // 처방내역
    {
      "receptionNo": "", // 4061100 - 환자의 진료접수번호
      "billNo": "", // 39582580030 - 진료영수증번호
      "treatDate": "", // 처방전교부일자
      "dosingDate": "", // 외래:처방일자와 동일, 입원의 경우 다를 수 있음
      "doctorLicense": "", // 처방의사 면허번호
      "doctorNm": "", // 처방의사 성명
      "specificCode": "", // 산정특례해당 환자에게 부여된 V코드 (ex) v193
      "emrCode": "", // 병원이 자체적으로 사용하는 의료수가코드
      "ediCode": "", // 심평원EDI코드
      "itemNm": "", // EDI 코드명 또는 병원이 자체적으로 사용하는 의료수가 명칭
      "dosingType": "", // 0: 내복, 1: 외용, 2: 주사
      "dosingAmtOnce": "", // 1회 투여량(복용량)
      "dosingCntPerDay": "", // 일일 투약(투여)횟수
      "dosingDays": "", // 투여(복용) 일수
      "prescriptionNo": "", // 처방전교부번호 전체
      "paymentPerCode": "", // 본인부담율구분코드(A,B,U,D,V,W) [주5 본인부담율코드]
      "dosingMethod": "", // 용법설명
    },
  ],
};

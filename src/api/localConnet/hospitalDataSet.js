const patiResData = {
  checkpoint: {
    lastPatiChartNum: 100, // 전송한 마지막 환자 번호(숫자) 100개씩 예상
    lastResNum: 5000, // 전송한 마지막 예약 번호(숫자) 1000개씩 예상
  },
  hsp_email: "대표 이메일", // 지속적으로 필요
  patients: [ // 환자 정보
    {
      pati_name: "환자 이름",
      pati_rrn: "환자 주민번호(생년월일)",
      pati_cellphone: "환자 휴대폰번호",
      pati_chartNumber: "환자 차트번호",
      pati_gender: "남자: false, 여자: true",
    },
  ],
  reservations: [ // 예약정보
    {
      re_emrId: "emr의 예약 id",
      re_desireDate: "예약 희망 일",
      re_desireTime: "예약 희망 시간(10:30)",
      re_resDate: "예약일자",
      re_time: "예약 시간(09:30)",
      re_status: "예약 상태 ",
      re_platform: "예약 매체",
      re_patientName: "예약자(환자) 이름",
      re_patientRrn: "예약자(환자) 주민번호 871012-1",
      re_patientCellphone: "예약자(환자) 휴대폰번호",
      re_chartNumber: "환자 차트번호",
      re_LCategory: "예약구분 - 대분류 50자",
      re_SCategory: "예약구분 - 소분류 50자",
      re_doctorRoomName: "진료실 이름",
    },
  ],
  doctorRoom: [ // 진료실 정보
    {
      dr_deptCode: " 진료실 코드",
      dr_roomName: " 진료실 이름",
      dr_doctorName: " 진료실 의사 이름",
      dr_medicalSub: " 진료과목",
    },
  ],
  hospital: { // 병원정보
    hsp_name: "병원 이름",
    hsp_chief: "병원 대표자명",
    hsp_hospitalNumber: "요양기관번호",
    hsp_businessNumber: "사업자번호",
    hsp_phone: "병원 전화번호 '-' 없이",
    hsp_medicalDepartment: "진료과목",
  },
};

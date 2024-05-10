import axios from "axios";
import getInfobankToken from "../../api/expApi/router/Infobank/getInfobankToken";

const ibResUpdate = async (re_id, reservation, hospital) => {
  try {
    const getToken = (await getInfobankToken()).accessToken;

    /** params 설명
     * reservaionNum: Varchar(200) Y 플랫폼 예약 고유 식별 값
     * botId: Varchar(200) Y 병원 채널 챗봇 연결 시 발급받는 bot id
     * appUserId: Varchar(200) Y 카카오 챗봇 사용자 식별값
     * hospitalName: Varchar(100) Y 병원 이름
     * name: Varchar(10) Y 환자 이름
     * phoneNumber: Varchar(14) Y 환자 전화번호
     * birthDate: Date Y 환자 생년월일
     * reservationDate: Date Y 진료 희망날짜
     * reservationTime: Varchar(10) Y 진료 희망시간
     * reservedTreatment: Varchar(100) Y 예약 진료항목
     * reservedOfficeName: Varchar(100) Y 예약 진료실
     * reservationStatus: Char(1) Y 예약 상태(0: 접수 / 1: 확정 / 2: 취소)
     * requirement: Varchar N 요청 사항
     * proxyReservationYn: Char(1) Y 대리 예약 여부(Y: 대리 예약/ N: 본인 예약)
     * visited: Varchar(5) Y 신환 : new / 구환 : old
     */

    const updateResInfoUrl =
      process.env.NODE_ENV === "production"
        ? "https://chatbot.infobank.net:7443/chatbot/api/prm/reservations/update"
        : "https://devmsg.supersms.co/chatbot/api/prm/reservations/update"; // 개발용 새로 전달받은 api

    const updateResInfo = {
      reservationNum: re_id.toString(),
      botId: hospital.hsp_chatbotId,
      appUserId: reservation.re_appUserId,
      hospitalName: hospital.hsp_name,
      name: reservation.re_patientName,
      phoneNumber: reservation.re_patientCellphone,
      birthDate: reservation.re_patientRrn,
      reservationDate: new Date(reservation.re_resDate).toISOString().split("T")[0],
      reservationTime: reservation.re_time,
      reservedTreatment: reservation.re_reservedTreatment,
      reservedOfficeName: reservation.re_doctorRoomName,
      reservationStatus:
        reservation.re_status === "waiting"
          ? "0"
          : reservation.re_status === "confirm" || reservation.re_status === "complete"
          ? "1"
          : "2",
      requirement: reservation.re_requirement,
      proxyReservationYn: reservation.re_proxyReservationYn ? "Y" : "N",
      // visited: , // 환자 데이터를 구분하여 가지고 있지 않음. 전달 불가
    };

    const header = {
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
      Authorization: `Bearer ${getToken}`,
    };

    await axios.put(updateResInfoUrl, updateResInfo, {
      headers: header,
    });

    return true;
  } catch (e) {
    console.log("인포뱅크 예약 정보 수정내역 전달 실패. ibResUpdate:", e);
    return false;
  }
};

export default ibResUpdate;

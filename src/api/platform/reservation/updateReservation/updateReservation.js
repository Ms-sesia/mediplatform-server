import { PrismaClient } from "@prisma/client";
import getInfobankToken from "../../../expApi/router/Infobank/getInfobankToken";
import axios from "axios";

const prisma = new PrismaClient();

export default {
  Mutation: {
    updateReservation: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const {
        re_id,
        resDate,
        time,
        status,
        largeCategory,
        smallCategory,
        doctorRoomName,
        dr_deptCode,
        oneLineMemo,
        alimType,
        alimTime1,
        alimTime2,
        alimTime3,
        alimTime4,
        alimTemplateId,
      } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const rsDate = new Date(resDate);

        const drRoom = await prisma.doctorRoom.findFirst({
          where: { AND: [{ hsp_id: loginUser.hsp_id }, { dr_deptCode }] },
        });

        // const resInfo = await prisma.reservation.findUnique({
        //   where: { re_id },
        // });

        const reservation = await prisma.reservation.update({
          where: { re_id },
          data: {
            re_editorId: loginUser.user_id,
            re_editorName: loginUser.user_name,
            re_editorRank: loginUser.user_rank,
            re_year: rsDate.getFullYear(),
            re_month: rsDate.getMonth() + 1,
            re_date: rsDate.getDate(),
            re_time: time,
            re_status: status,
            re_LCategory: largeCategory,
            re_SCategory: smallCategory,
            re_doctorRoomName: doctorRoomName,
            re_doctorRoomId: drRoom.dr_id,
            re_oneLineMem: oneLineMemo,
            resAlim: {
              update: {
                data: {
                  ra_type: alimType,
                  ra_time1: alimTime1,
                  ra_time2: alimTime2,
                  ra_time3: alimTime3,
                  ra_time4: alimTime4,
                  ra_templateId: alimTemplateId,
                },
              },
            },
          },
        });

        console.log("user:", user);
        const hospital = await prisma.hospital.findUnique({
          where: { hsp_id: user.hospital.hsp_id },
        });

        if (reservation.re_platform === "kakao") {
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
            reservaionNum: re_id.toString(),
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
              reservation.re_status === "waiting" ? "0" : reservation.re_status === "confirm" ? "1" : "2",
            requirement: reservation.re_requirement,
            proxyReservationYn: reservation.re_proxyReservationYn ? "Y" : "N",
            // visited: , // 환자 데이터를 구분하여 가지고 있지 않음. 전달 불가
          };

          const updateResult = await axios.put(updateResInfoUrl, updateResInfo, {
            headers: {
              "Content-Type": "application/json;charset=UTF-8",
              Accept: "application/json",
              Authorization: `Bearer ${getToken}`,
            },
          });

          console.log("updateResult:", updateResult);
        }

        return true;
      } catch (e) {
        console.log("예약자 정보 수정 실패. updateReservation", e);
        throw new Error("err_00");
      }
    },
  },
};

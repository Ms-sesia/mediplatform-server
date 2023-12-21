import { PrismaClient } from "@prisma/client";
import axios from "axios";
import schedule from "node-schedule";

const prisma = new PrismaClient();

export default async () => {
  // 초 분 시 일 월 요일(0-7, 0 or 7 is sun)
  // 매일 12시(자정)

  // 5분마다 실행됨
  schedule.scheduleJob("0 */5 * * * *", async () => {
    const todayHour = new Date().getHours();
    // console.log("tobe todayHour:", todayHour);
    /**
     * 투비콘 매 5분마다 오전 8시부터 오후 8시까지 (시간 확실하게 정과장님 문의 )
     */
    if (todayHour > 8 && todayHour < 20) {
      const getUrl = "https://dev.tobecon.io";
      const getRoute = "/api/emr/addition";

      const params = {
        unique: "21FA05DF-E8CF-47BD-9116-0F9E8F19A5A4",
        patno: "P000001",
        date: "20230923",
        claimDate: "2023-09-23 00:00:00.000",
      };

      const emrAddData = axios.get(getRoute, {
        baseURL: getUrl,
        params,
        headers: { Authorization: "Bearer TVMwMDAwMDE6TVMwMDAwMDE=" },
      });

      // console.log((await emrAddData).data);
      // console.log("---------- 투비콘 매 5분마다 요청");
    }
  });
};

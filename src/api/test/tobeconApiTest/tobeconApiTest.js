import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { today9 } from "../../../libs/todayCal";

const prisma = new PrismaClient();

export default {
  Mutation: {
    tobeconApiTest: async (_, args, { request, isAuthenticated }) => {
      try {
        const today = new Date();
        // const todayHour = today9.getHours();
        const todayHour = today.getHours() + 5;
        console.log(today.toISOString());
        console.log(todayHour, typeof todayHour);
        // const getUrl = "https://dev.tobecon.io";
        // const getRoute = "/api/emr/addition";

        // const params = {
        //   unique: "21FA05DF-E8CF-47BD-9116-0F9E8F19A5A4",
        //   patno: "P000001",
        //   date: "20230923",
        //   claimDate: "2023-09-23 00:00:00.000",
        // };

        // const emrAddData = axios.get(getRoute, {
        //   baseURL: getUrl,
        //   params,
        //   headers: { Authorization: "Bearer TVMwMDAwMDE6TVMwMDAwMDE=" },
        // });

        // console.log((await emrAddData).data);

        return true;
      } catch (e) {
        console.log("투비콘 연동 실패. tobiconApiTest", e);
        throw new Error("err_00");
      }
    },
  },
};

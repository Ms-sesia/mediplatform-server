import { PrismaClient } from "@prisma/client";
import axios from "axios";
import webSocket from "../../../libs/webSocket/webSocket";

const prisma = new PrismaClient();

export default {
  Mutation: {
    tobeconApiTest: async (_, args, { request, isAuthenticated }) => {
      try {
        const hospital = await prisma.hospital.findUnique({ where: { hsp_id: 3 } });

        const getUrl = "https://dev.tobecon.io";
        const getRoute = "/api/emr/addition";

        // 투비콘 전송 정보
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

        // 가져온 요청 데이터
        const insHistory = (await emrAddData).data;
        console.log("투비콘에서 받은 데이터:", insHistory);

        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // 요청번호 확인(오늘 만들어진 번호 확인)
        const findIhNum = await prisma.ihNum.findFirst({
          where: { ihn_createdAt: { gte: startToday, lte: endToday } },
        });
        const ihNum = findIhNum ? findIhNum.ihn_num : 0;
        let reqNum = 0;

        const socketIo = await webSocket();
        const pub = socketIo.pub;

        const channelName = `h-${hospital.hsp_email}`;

        // 요청 기록 생성 및 데이터 요청
        for (let i = 0; i < insHistory.length; i++) {
          // 요청 데이터 확인
          const checkInsure = await prisma.insuranceHistory.findMany({
            where: { ih_tobeUnique: { contains: insHistory[i].unique } },
          });

          // 없으면 생성
          if (!checkInsure.length) {
            console.log(insHistory[i]);
            // 요청번호 증가
            reqNum = i === 0 ? ihNum + 1 : ihNum + i + 1;
            const dateForNum = today.toISOString().split("T")[0].replaceAll("-", "");
            const createIh = await prisma.insuranceHistory.create({
              data: {
                ih_companyName: "tobecon",
                ih_reqNumber: `${dateForNum}-${reqNum}`,
                ih_tobeUnique: insHistory[i].unique,
                ih_tobePatno: insHistory[i].patno,
                ih_tobeDate: insHistory[i].date,
                ih_tobeClaimDate: insHistory[i].claimDate,
                hospital: { connect: { hsp_id: hospital.hsp_id } },
              },
            });

            // 청구 요청 내용 기록
            await prisma.ihText.create({
              data: {
                iht_text: `투비콘에서 환자번호[${insHistory[i].patno}]의 실손보험요청 받았어요.`,
                insuranceHistory: { connect: { ih_id: createIh.ih_id } },
              },
            });

            const reqInsureData = {
              SendStatus: "reqInsureData",
              company: "tobecon",
              data: insHistory[i],
            };

            const returnPub = await pub.publish(channelName, JSON.stringify(reqInsureData));
            if (returnPub) {
              // 요청 실패
              console.log("요청 성공. unique:", insHistory[i].unique);
              await prisma.ihText.create({
                data: {
                  iht_text: `플랫폼 -> EMR로 데이터를 요청하였습니다.`,
                  insuranceHistory: { connect: { ih_id: createIh.ih_id } },
                },
              });
            } else {
              console.log("요청 실패. unique:", insHistory[i].unique);
              await prisma.ihText.create({
                data: {
                  iht_text: `플랫폼 -> EMR로 데이터 요청에 실패하였습니다.`,
                  insuranceHistory: { connect: { ih_id: createIh.ih_id } },
                },
              });

              await prisma.insuranceHistory.update({
                where: { ih_id: createIh.ih_id },
                data: { ih_status: "fail" },
              });
            }
          }
        }

        // 요청 기록을 생성했으면(0이 아니면)
        if (reqNum !== 0) {
          findIhNum
            ? await prisma.ihNum.update({ where: { ihn_id: findIhNum.ihn_id }, data: { ihn_num: reqNum } })
            : await prisma.ihNum.create({ data: { ihn_num: reqNum } });
        }

        return true;
      } catch (e) {
        console.log("투비콘 연동 실패. tobiconApiTest", e);
        throw new Error("err_00");
      }
    },
  },
};

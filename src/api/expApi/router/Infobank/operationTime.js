import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    if (!req.query.botId) throw 1;

    const botId = req.query.botId;

    const hospital = await prisma.hospital.findFirst({
      where: { hsp_chatbotId: botId, hsp_isDelete: false },
      select: {
        hsp_id: true,
        hsp_name: true,
        hsp_hospitalNumber: true,
        hsp_phone: true,
        hsp_address: true,
        hsp_detailAddress: true,
      },
    });

    if (!hospital) throw 3;

    const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    let hspOperTime = new Array();
    for (let i = 0; i < 7; i++) {
      const hspSche = await prisma.defaultSchedule.findFirst({
        where: {
          hsp_id: hospital.hsp_id,
          ds_isDelete: false,
          ds_day: weekdays[i],
        },
      });

      if (!hspSche) {
        hspOperTime.push({
          hospitalName: hospital.hsp_name,
          day: (i + 1).toString(),
          openYn: "N",
          openTimeStart: "",
          openTimeEnd: "",
          lunchTimeYn: "N",
          lunchTimeStart: "",
          lunchTimeEnd: "",
        });
        continue;
      }
      const startHour = hspSche.ds_startHour < 10 ? `0${hspSche.ds_startHour}` : hspSche.ds_startHour.toString();
      const startMin = hspSche.ds_startMin < 10 ? `0${hspSche.ds_startMin}` : hspSche.ds_startMin.toString();
      const endHour = hspSche.ds_endHour < 10 ? `0${hspSche.ds_endHour}` : hspSche.ds_endHour.toString();
      const endMin = hspSche.ds_endMin < 10 ? `0${hspSche.ds_endMin}` : hspSche.ds_endMin.toString();

      const lStartHour = hspSche.ds_lbStartHour < 10 ? `0${hspSche.ds_lbStartHour}` : hspSche.ds_lbStartHour.toString();
      const lStartMin = hspSche.ds_lbStartMin < 10 ? `0${hspSche.ds_lbStartMin}` : hspSche.ds_lbStartMin.toString();
      const lEndHour = hspSche.ds_lbEndHour < 10 ? `0${hspSche.ds_lbEndHour}` : hspSche.ds_lbEndHour.toString();
      const lEndMin = hspSche.ds_lbEndMin < 10 ? `0${hspSche.ds_lbEndMin}` : hspSche.ds_lbEndMin.toString();

      hspOperTime.push({
        hospitalName: hospital.hsp_name,
        day: (i + 1).toString(),
        openYn: "Y",
        openTimeStart: `${startHour}:${startMin}`,
        openTimeEnd: `${endHour}:${endMin}`,
        lunchTimeYn: hspSche.ds_lunchBreak ? "Y" : "N",
        lunchTimeStart: `${lStartHour}:${lStartMin}`,
        lunchTimeEnd: `${lEndHour}:${lEndMin}`,
      });
    }

    return res.status(200).json(hspOperTime);
  } catch (e) {
    console.log(`Api Error - operationTime : 병원 운영시간 전송 에러. ${e}`);
    let errMsg = "병원 운영시간을 조회하는데 실패하였습니다.";

    if (e === 1 || e === 3)
      return res.status(400).json({
        errMsg: "botId를 확인해주세요.",
      });

    return res.status(404).json({ errMsg });
  }
});

export default router;

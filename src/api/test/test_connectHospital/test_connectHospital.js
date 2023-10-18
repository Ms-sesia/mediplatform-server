import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { hspData, patiData, resData } from "../../../libs/hospitalDataSet";

const prisma = new PrismaClient();

export default {
  Mutation: {
    test_connectHospital: async (_, args, { request, isAuthenticated }) => {
      try {
        const apiUrl = "https://medipf.platcube.info";

        // const hospital = await axios.post(`${apiUrl}/api/getHospital/`, hspData, {
        //   // headers: { Authorization: "Bearer TVMwMDAwMDE6TVMwMDAwMDE=" },
        // });
        // const patient = await axios.post(`${apiUrl}/api/sendPatient/`, patiData, {
        //   // headers: { Authorization: "Bearer TVMwMDAwMDE6TVMwMDAwMDE=" },
        // });
        const reservation = await axios.post(`${apiUrl}/api/sendReservation/`, resData, {
          // headers: { Authorization: "Bearer TVMwMDAwMDE6TVMwMDAwMDE=" },
        });

        // console.log("send hospital:", hospital.data);
        // console.log("send patient:", patient.data);
        console.log("send reservation:", reservation.data);

        return true;
      } catch (e) {
        console.log("test_connectHospital 실패. =>\n", e);
        throw new Error("test_connectHospital 실패하였습니다.");
      }
    },
  },
};

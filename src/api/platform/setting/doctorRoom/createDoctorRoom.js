import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../generate";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createDoctorRoom: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { dr_doctorRoomCode, dr_roomName, dr_doctorName, dr_doctorRank } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const doctorRoom = await prisma.doctorRoom.create({
          data: {
            dr_creatorName: loginUser.user_name,
            dr_creatorRank: loginUser.user_rank,
            dr_creatorId: loginUser.user_id,
            dr_doctorRoomCode,
            dr_roomName,
            dr_doctorName,
            dr_doctorRank,
            hospital: { connect: { hsp_id: user.hospital.hsp_id } },
          },
        });

        const dids = await prisma.did.findMany({ where: { hsp_id: user.hospital.hsp_id } });

        // 생성된 did가 있을 경우 did진료실 생성
        if (dids.length) {
          dids.map(async (did, idx) => {
            await prisma.didDoctorRoom.create({
              data: {
                ddr_info: `${doctorRoom.dr_doctorName} ${doctorRoom.dr_doctorRank}`,
                ddr_number: idx + 1,
                did: { connect: { did_id: did.did_id } },
              },
            });
          });
        }

        return true;
      } catch (e) {
        console.log("진료실 등록 실패. createDoctorRoom", e);
        throw new Error("진료실 등록에 실패하였습니다.");
      }
    },
  },
};

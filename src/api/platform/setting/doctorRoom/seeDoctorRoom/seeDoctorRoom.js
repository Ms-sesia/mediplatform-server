import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Query: {
    seeDoctorRoom: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      try {
        const doctorRoomList = await prisma.doctorRoom.findMany({
          where: { AND: [{ dr_isDelete: false }, { hsp_id: user.hospital.hsp_id }] },
          orderBy: { dr_roomName: "asc" },
        });

        if (!doctorRoomList.length)
          return {
            totalLength: 0,
            doctorRoomList: [],
          };

        return {
          totalLength: doctorRoomList.length ? doctorRoomList.length : 0,
          doctorRoomList: doctorRoomList.length ? doctorRoomList : [],
        };
      } catch (e) {
        console.log("진료실 정보 조회 실패. seeDoctorRoom ==>\n", e);
        throw new Error("err_00");
      }
    },
  },
};

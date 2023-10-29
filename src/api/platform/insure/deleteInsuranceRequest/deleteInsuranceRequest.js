import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export default {
  Mutation: {
    deleteInsuranceRequest: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { ih_id } = args;
      try {
        const loginUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });

        const deleteIh = await prisma.insuranceHistory.update({
          data: {
            ih_editorId: loginUser.user_id,
            ih_editorName: loginUser.user_name,
            ih_editorRank: loginUser.user_rank,
            ih_isDelete: true,
            ih_deleteDate: new Date(),
          },
        });

        return true;
      } catch (e) {
        console.log("보험청구 요청 기록 삭제 실패. deleteInsuranceRequest", e);
        throw new Error("err_00");
      }
    },
  },
};

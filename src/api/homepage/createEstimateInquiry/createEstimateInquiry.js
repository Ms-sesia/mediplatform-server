import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createEstimateInquiry: async (_, args, { request, isAuthenticated }) => {
      const {
        ei_medicalSub,
        ei_pcCount,
        ei_RDR,
        ei_CR,
        ei_XRAY,
        ei_CArm,
        ei_Mammography,
        ei_ultrasonicWave,
        ei_endoscope,
        ei_CT,
        ei_MRI,
        ei_arteriosclerosis,
        ei_spirometer,
        ei_ECG,
        ei_PACS,
        ei_remoteImageReading,
        ei_name,
        ei_hospitalName,
        ei_workArea,
        ei_cellphone,
        ei_email,
        ei_etc,
      } = args;
      try {
        await prisma.estimateInquiry.create({
          data: {
            ei_medicalSub,
            ei_pcCount,
            ei_RDR,
            ei_CR,
            ei_XRAY,
            ei_CArm,
            ei_Mammography,
            ei_ultrasonicWave,
            ei_endoscope,
            ei_CT,
            ei_MRI,
            ei_arteriosclerosis,
            ei_spirometer,
            ei_ECG,
            ei_PACS,
            ei_remoteImageReading,
            ei_name,
            ei_hospitalName,
            ei_workArea,
            ei_cellphone,
            ei_email,
            ei_etc,
          },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 견적 문의 데이터 생성 실패. createEstimateInquiry", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createGeneralInquiry: async (_, args, { request, isAuthenticated }) => {
      const { title, text, name, hospitalName, workArea, cellphone, email } = args;
      try {
        await prisma.generalInquiry.create({
          data: {
            gi_title: title,
            gi_text: text,
            gi_name: name,
            gi_hospitalName: hospitalName,
            gi_workArea: workArea,
            gi_cellphone: cellphone,
            gi_email: email,
          },
        });

        return true;
      } catch (e) {
        console.log("홈페이지 일반 문의 데이터 생성 실패. createGeneralInquiry", e);
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00");
      }
    },
  },
};

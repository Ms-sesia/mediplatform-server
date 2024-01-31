import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../generate";
import { hashPassword } from "../../../../libs/passwordHashing";
import sendEmail from "../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createHospital: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { name, useStartDate, useEndDate, chief, email, country, businessNumber, hospitalNumber } = args;
      try {
        if (user.userType !== "admin") throw 0;
        // 이메일 중복 체크
        const hospitalEmailCheck = await prisma.hospital.findUnique({ where: { hsp_email: email } });
        if (hospitalEmailCheck) throw 1;
        const userEmailCheck = await prisma.user.findUnique({ where: { user_email: email } });
        if (userEmailCheck) throw 2;

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);

        const startDate = new Date(useStartDate);
        const endDate = new Date(useEndDate);
        const contractStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 9);
        const contractEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 9);

        const title = "메디플랫폼 가입 안내 메일";
        const text = `안녕하세요. 메디플랫폼 입니다.<br>
        이 메일은 메디플랫폼 이용 병원 등록정보 및 마스터 계정 정보 전달용 메일입니다.<br>
        <br>
        병원 등록 정보는 아래와 같습니다.<br>
        <br>
        병원명 : ${name}<br>
        계약시작일 : ${contractStartDate.toISOString().split("T")[0]}<br>
        계약종료일 : ${contractEndDate.toISOString().split("T")[0]}<br>
        대표자명 : ${chief}<br>
        이메일 : ${email}<br>
        사용국가 : ${country}<br>
        사업자번호 : ${businessNumber}<br>
        요양기관번호 : ${hospitalNumber}<br>
        <br>
        생성된 계정의 정보는 아래와 같습니다.<br>
        <br>
        아이디(email) : ${email}<br>
        임시비밀번호 : ${tempPw}<br>
        <br>
        로그인 후 비밀번호를 변경하고 사용해주세요.<br>
        감사합니다.`;

        await sendEmail(email, title, text);

        const admin = await prisma.admin.findUnique({ where: { admin_id: user.admin_id } });
        // 병원 등록
        const hospital = await prisma.hospital.create({
          data: {
            hsp_adminCreatorName: admin.admin_name,
            hsp_adminCreatorRank: admin.admin_rank,
            hsp_adminCreatorId: admin.admin_id,
            hsp_name: name,
            hsp_useStartDate: contractStartDate,
            hsp_useEndDate: contractEndDate,
            hsp_chief: chief,
            hsp_email: email,
            hsp_country: country,
            hsp_businessNumber: businessNumber,
            hsp_hospitalNumber: hospitalNumber,
            alimSet: {
              create: {},
            },
          },
        });

        const isRank = await prisma.rank.findMany({
          where: { AND: [{ hsp_id: hospital.hsp_id }, { rank_name: "대표원장" }] },
        });

        if (!isRank.length) {
          const rank = await prisma.rank.create({
            data: {
              rank_name: "대표원장",
              hospital: { connect: { hsp_id: hospital.hsp_id } },
            },
          });

          await prisma.rankPermission.create({
            data: {
              rp_reservation: true,
              rp_schedule: true,
              rp_patient: true,
              rp_did: true,
              rp_insurance: true,
              rp_cs: true,
              rp_setting: true,
              rank: { connect: { rank_id: rank.rank_id } },
            },
          });
        }

        const hashedInfo = await hashPassword(tempPw);

        await prisma.user.create({
          data: {
            user_name: name,
            user_email: email,
            user_salt: hashedInfo.salt,
            user_rank: "대표원장",
            user_password: hashedInfo.password,
            hospital: { connect: { hsp_id: hospital.hsp_id } },
          },
        });

        return true;
      } catch (e) {
        console.log("병원 추가 실패. createHospital", e);
        if (e === 0) throw new Error("err_01"); // 플랫폼 관리자만 사용할 수 있는 기능입니다.
        if (e === 1) throw new Error("err_02"); //해당 이메일로 이미 가입된 병원이 있습니다. 이메일을 확인해주세요.
        if (e === 2) throw new Error("err_03"); //해당 이메일로 이미 가입된 사용자가 있습니다. 이메일을 확인해주세요.
        throw new Error("err_00"); // 병원 추가에 실패하였습니다.
      }
    },
  },
};

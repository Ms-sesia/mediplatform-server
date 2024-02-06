import { PrismaClient } from "@prisma/client";
import { genRandomCode } from "../../../../../generate";
import { hashPassword } from "../../../../../libs/passwordHashing";
import sendEmail from "../../../../../libs/sendEmail";

const prisma = new PrismaClient();

export default {
  Mutation: {
    createUser: async (_, args, { request, isAuthenticated }) => {
      isAuthenticated(request);
      const { user } = request;
      const { name, birthday, cellphone, email, org, rank, job } = args;
      try {
        // 이메일 중복과 탈퇴여부 체크
        const emailDuplicateCheck = await prisma.user.findMany({
          where: { AND: [{ user_email: email }, { user_isDelete: false }] },
        });
        if (emailDuplicateCheck.length) throw 1;

        // 10자리 랜덤 문자열(임시 비밀번호)
        const tempPw = genRandomCode(8);

        const birth = new Date(birthday);
        const convBirth = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());

        const title = "메디플랫폼 가입 안내 메일";
        const text = `안녕하세요. 메디플랫폼 계정생성 안내 메일입니다.<br>생성된 계정의 정보는 아래와 같습니다.<br><br>ID(email) : ${email}<br>password : ${tempPw}<br><br>로그인 후 비밀번호를 변경하고 사용해주세요.<br>감사합니다.`;
        await sendEmail(email, title, text);

        const hashedInfo = await hashPassword(tempPw);

        const deleteCheck = await prisma.user.findFirst({
          where: { AND: [{ user_email: email }, { user_isDelete: true }] },
        });
        let createUser;

        // 삭제된 유저가 아닐 경우(신규가입) 생성
        if (!deleteCheck) {
          createUser = await prisma.user.create({
            data: {
              user_name: name,
              user_birthday: convBirth.toISOString(),
              user_cellphone: cellphone.replaceAll("-", ""),
              user_email: email,
              user_org: org,
              user_rank: rank,
              user_job: job,
              user_salt: hashedInfo.salt,
              user_password: hashedInfo.password,
              hospital: { connect: { hsp_id: user.hospital.hsp_id } },
              userPermission: {
                create: {},
              },
            },
          });
          //삭제된 유저일 경우 탈퇴여부 해제
        } else {
          createUser = await prisma.user.update({
            where: { user_id: deleteCheck.user_id },
            data: {
              user_name: name,
              user_birthday: convBirth.toISOString(),
              user_cellphone: cellphone.replaceAll("-", ""),
              user_email: email,
              user_org: org,
              user_rank: rank,
              user_job: job,
              user_salt: hashedInfo.salt,
              user_password: hashedInfo.password,
              user_isDelete: false,
              hospital: { connect: { hsp_id: user.hospital.hsp_id } },
            },
          });
        }

        if (rank) {
          const findRank = await prisma.rank.findFirst({
            where: { AND: [{ hsp_id: user.hospital.hsp_id }, { rank_name: rank }] },
          });

          const rankPermission = await prisma.rankPermission.findUnique({
            where: { rank_id: findRank.rank_id },
          });

          const userpermission = await prisma.userPermission.findUnique({ where: { user_id: createUser.user_id } });

          if (userpermission)
            await prisma.userPermission.update({
              where: { user_id: createUser.user_id },
              data: {
                up_reservation: rankPermission.rp_reservation,
                up_schedule: rankPermission.rp_schedule,
                up_patient: rankPermission.rp_patient,
                up_did: rankPermission.rp_did,
                up_insurance: rankPermission.rp_insurance,
                up_cs: rankPermission.rp_cs,
                up_setting: rankPermission.rp_setting,
              },
            });
          else
            await prisma.userPermission.create({
              data: {
                up_reservation: rankPermission.rp_reservation,
                up_schedule: rankPermission.rp_schedule,
                up_patient: rankPermission.rp_patient,
                up_did: rankPermission.rp_did,
                up_insurance: rankPermission.rp_insurance,
                up_cs: rankPermission.rp_cs,
                up_setting: rankPermission.rp_setting,
                user: { connect: { user_id: createUser.user_id } },
              },
            });
        }

        return true;
      } catch (e) {
        console.log("사용자 추가 실패. createUser", e);
        // if (e === 1) throw new Error("해당 이메일로 이미 가입된 사용자가 있습니다. 이메일을 확인해주세요.");
        if (e === 1) throw new Error("err_01");
        throw new Error("err_00"); // 기본에러
      }
    },
  },
};

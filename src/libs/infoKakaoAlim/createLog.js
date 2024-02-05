import path from "path";
import fs from "fs";

export const createAlimTalkLog = async (req, res, next) => {
  const today = new Date(new Date().setHours(new Date().getHours() + 9)).toISOString();
  const storagePath = path.join(__dirname, "../../../", "logs/alimtalkLog");
  const filename = `${today.split("T")[0]}_infobankAlimtalk.log`;

  try {
    // 파일이 없을경우 빈 파일 생성
    if (!fs.existsSync(`${storagePath}/${filename}`)) {
      fs.writeFileSync(`${storagePath}/${filename}`, "");
    }

    // 파일 이어쓰기
    fs.appendFileSync(
      `${storagePath}/${filename}`,
      `${JSON.stringify(req.body)}\n----------------------------------------------------------------------\n`
    );
  } catch (e) {
    console.log("인포뱅크 카카오알림톡 로그기록 실패 =>", e);
  }

  next();
};

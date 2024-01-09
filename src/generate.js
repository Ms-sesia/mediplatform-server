import jwt from "jsonwebtoken";

export const generateSecretCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (user) => {
  // if (user.userType === "user") return jwt.sign(user, process.env.JWT_SECRET);
  const expired = new Date();
  // 인증 만료시간 1분 테스트
  // expired.setMinutes(expired.getMinutes() + 1);
  // 인증 만료시간 24시간.
  expired.setHours(expired.getHours() + 9 + 9);
  user.expired = expired.getTime();
  return jwt.sign(user, process.env.JWT_SECRET);
};

export const genRandomCode = (stringLength) => {
  // const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ!@#$%^&";
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ";
  // const stringLength = 6;
  let randomstring = "";
  for (let i = 0; i < stringLength; i++) {
    const rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

// did unique id 생성
export const genDidUnique = (didId) => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ";

  const setNum = didId % 100000; // 숫자 부분(나머지)
  const charIndex = Math.floor((didId - 1) / 100000) % chars.length; // 알파벳 인덱스
  const setChar = chars[charIndex]; // 알파벳 문자
  const convNum = String(setNum).padStart(5, "0"); // 5자리 숫자 포맷

  return setChar + convNum;
};

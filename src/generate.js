import jwt from "jsonwebtoken";

export const generateSecretCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateToken = (user) => {
  if (user.userType === "user") return jwt.sign(user, process.env.JWT_SECRET);
  const expired = new Date();
  // 인증 만료시간 1분 테스트
  // expired.setMinutes(expired.getMinutes() + 1);
  // 인증 만료시간 24시간.
  expired.setHours(expired.getHours() + 9 + 9);
  user.expired = expired.getTime();
  return jwt.sign(user, process.env.JWT_SECRET);
};

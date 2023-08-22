export const isAuthenticated = (request) => {
  if (!request.user) throw new Error("먼저 로그인이 필요합니다.");
  return;
};

// export const tokenParse = (req, res, next) => {
//   const token = req.headers.authorization || "";

//   if (token) {
//     const base64Payload = token.split(".")[1]; //value 0 -> header, 1 -> payload, 2 -> VERIFY SIGNATURE
//     const payload = Buffer.from(base64Payload, "base64");
//     const user = JSON.parse(payload.toString());
//     req.user = user;
//   }

//   next();
// };

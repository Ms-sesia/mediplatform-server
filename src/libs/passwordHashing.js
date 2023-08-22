import crypto from "crypto";

export const hashPassword = async (password) => {
  try {
    const salt = crypto.randomBytes(16).toString("base64");
    const hashed = crypto.pbkdf2Sync(password, salt, 100, 32, "sha256");

    return {
      salt,
      password: hashed.toString("base64"),
      error: "",
    };
  } catch (e) {
    console.log("hashing error. encrypt ==>", e);
    return {
      salt: "",
      password: "",
      error: "암호화 오류. (encrypt)",
    };
  }
};

export const makeHashPassword = async (salt, password) => {
  try {
    const hashed = crypto.pbkdf2Sync(password, salt, 100, 32, "sha256");

    return {
      salt,
      password: hashed.toString("base64"),
      error: "",
    };
  } catch (e) {
    console.log("hashing error. encrypt ==>", e);
    return {
      salt: "",
      password: "",
      error: "암호화 오류. (encrypt)",
    };
  }
};

// export const maskName = (name) => {
//   if (name.length < 3) return name.replace(/./g, "*"); // 이름이 2자 이하인 경우 모두 마스킹
//   return name.slice(0, 1) + "*".repeat(name.length - 2) + name.slice(-1); // 이름 첫 글자와 마지막 글자 제외 마스킹
// };

// // export const maskCellphone = (cellphone) => cellphone.replace(/(\d{3})-\d{4}-(\d{4})/, "$1-****-$2");
// export const maskCellphone = (cellphone) => cellphone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
// export const createSocialNumber = (birthday, gender) => {
//   const [year, month, day] = birthday.split("-").map((v) => v.slice(-2)); // 뒤의 2자리만 추출
//   const genderCode = gender ? "2" : "1"; // 여자면 2, 남자면 1
//   return `${year}${month}${day}-${genderCode}`;
// };

// export const maskSocialNumber = (socialNumber) => "******-" + socialNumber.slice(-1);
// export const maskOther = (value) => "*".repeat(value.length);

export const maskEmail = (email) => {
  const [local, domain] = email.split("@");

  // 앞 3자리 제외한 나머지 * 표시
  const maskedLocal = local.length > 2 ? local[0] + local[1] + local[2] + "*".repeat(local.length - 3) : local;

  // // domainPart의 마스킹 (첫 글자와 마지막 글자를 제외하고 모두 *로 대체)
  // const maskedDomain =
  //   domain.length > 2 ? domain[0] + "*".repeat(domain.length - 2) + domain[domain.length - 1] : domain;

  return `${maskedLocal}@${domain}`;
};

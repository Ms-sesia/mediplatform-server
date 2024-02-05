// 핸드폰번호 유효성 검사
export const checkPhone = (number) => {
  // 한국 핸드폰 번호 패턴 (010으로 시작, 총 11자리 숫자)
  const pattern = /^010\d{8}$/;
  return pattern.test(number);
};

// 국제번호 변환
export const toInternationalFormat = (number) => {
  // '010'제거, '82' 추가
  if (checkPhone(number)) {
    return "82" + number.substring(1);
  } else {
    throw { errorCode: 1, number };
  }
};

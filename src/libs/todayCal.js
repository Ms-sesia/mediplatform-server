// export const today9 = new Date(new Date().setHours(new Date().getHours() + 9));
export const today9 = new Date();
export const weekdays_eng = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
// 요일별 인덱스를 반환하는 함수
export const getDayIndex = (day) => {
  return weekdays_eng.indexOf(day);
};

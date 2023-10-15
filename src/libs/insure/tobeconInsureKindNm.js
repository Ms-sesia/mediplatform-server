export const convInsureKindNum = (num) => {
  let convNum = "";
  switch (num) {
    case "P01":
      convNum = "H";
      break;
    case "P02":
      convNum = "S";
      break;
    case "P03":
      convNum = "I";
      break;
    case "P04":
      convNum = "E";
      break;
    case "P05":
      convNum = "G";
      break;
    case "P06":
      convNum = "E";
      break;
    case "P07":
      convNum = "E";
      break;
    case "P08":
      convNum = "E";
      break;
    case "P09":
      convNum = "E";
      break;
    case "P10":
      convNum = "E";
      break;
    case "P11":
      convNum = "E";
      break;
    case "P12":
      convNum = "E";
      break;
  }
  return convNum;
};

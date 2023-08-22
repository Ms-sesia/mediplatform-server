import multer from "multer";
import path from "path";

export default (subject) => {
  let diskPath;
  switch (subject) {
    case "uploadTest":
      diskPath = path.join(__dirname, "../../../", "Images");
      break;
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, diskPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  return storage;
};

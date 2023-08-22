import multer from "multer";
import setStorage from "./setStorage";

export const uploadSet = (subject) => {
  return (res, req, next) => {
    const storage = setStorage(subject);
    if (storage) req.storage = storage;
    next();
  };
};

export const upload = (req, res, next) => {
  const storage = req.res.storage;
  const upload = multer({ storage: storage }).array("file");
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json(err);
    }
    next();
  });
};

export const uploadController = async (req, res) => {
  const { files } = req;
  const location = [];
  for (let i = 0; i < files.length; i++) location.push(process.env.LOCALSTORAGEADDR + files[i].filename);
  return res.status(200).json(location);
};

import express from "express";
import path from "path";

const router = express.Router();

router.use(
  "/",
  express.static(path.join(__dirname, "../../../", "images")),
  express.static(path.join(__dirname, "../../../", "files")),
  express.static(path.join(__dirname, "../../../", "didMedia"))
);

export default router;

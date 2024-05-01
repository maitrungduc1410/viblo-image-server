const express = require("express");
const router = express.Router();
const { v4 } = require("uuid");
const multer = require("multer");
const { extname, join } = require("path");
const { unlink, readdir } = require("fs/promises");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${new Date().getTime()}_${v4()}${ext}`);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res, next) => {
  try {
    const files = await readdir(join(process.cwd(), "public/images"));
    const reversed = [...files].filter(item => item !== '.gitkeep').reverse().map((item) => ({
      tiny: `/images/tiny/${item}`,
      full: `/images/full/${item}`,
      path: `/images/${item}`,
    }));
    res.json(reversed);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/upload", upload.array("files"), (req, res, next) => {
  const { files } = req;

  const payload = files.map((file) => ({
    tiny: `/images/tiny/${file.filename}`,
    full: `/images/full/${file.filename}`,
    path: `/images/${file.filename}`,
  }));

  res.json(payload);
});

router.delete("/:filename", async (req, res, next) => {
  try {
    await unlink(join(process.cwd(), "public/images", req.params.filename));
    res.json({
      message: "success",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

module.exports = router;

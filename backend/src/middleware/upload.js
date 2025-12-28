const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseDir = path.join(__dirname, "../../uploads/external");

// ensure folders exist
["pan", "cheque"].forEach(dir => {
  const full = path.join(baseDir, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "pan_document") {
      cb(null, path.join(baseDir, "pan"));
    } else if (file.fieldname === "cancelled_cheque") {
      cb(null, path.join(baseDir, "cheque"));
    } else {
      cb(new Error("Invalid file field"));
    }
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/png", "image/jpeg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PDF/JPG/PNG allowed"));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

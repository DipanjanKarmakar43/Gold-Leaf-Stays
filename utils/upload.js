const multer = require("multer");
const ExpressError = require("./ExpressError");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new ExpressError(400, "Only JPG, PNG, WEBP or GIF images are allowed"));
  },
});
const mongoose = require("mongoose");
const Image = require("../models/image");
const ExpressError = require("../utils/ExpressError");

module.exports.serve = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ExpressError(404, "Image not found");
  }

  const img = await Image.findById(id);
  if (!img) {
    throw new ExpressError(404, "Image not found");
  }

  res.set({
    "Content-Type": img.contentType,
    // Safe to cache forever: every upload gets a brand new id
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  res.send(img.data);
};
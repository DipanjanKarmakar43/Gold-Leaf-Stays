const Image = require("../models/image");

// Saves an uploaded file (from multer memory storage) into MongoDB Atlas.
// Returns { url, filename } in the same shape your listing.image already uses.
module.exports.saveImage = async (file) => {
  const img = await Image.create({
    data: file.buffer,
    contentType: file.mimetype,
    size: file.size,
  });
  return { url: `/images/${img._id}`, filename: String(img._id) };
};

// Deletes an image from Atlas. Ignores old Cloudinary filenames safely.
module.exports.deleteImage = async (filename) => {
  if (filename && /^[a-f0-9]{24}$/i.test(filename)) {
    await Image.findByIdAndDelete(filename);
  }
};
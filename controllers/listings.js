const Listing = require("../models/listing");
const { saveImage, deleteImage } = require("../utils/imageStore");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.new = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash(
      "error",
      "Property you requested does not exist or has been deleted!",
    );
    return res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.create = async (req, res) => {
  if (!req.file) {
    req.flash("error", "Please upload an image for the property.");
    return res.redirect("/listings/new");
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = await saveImage(req.file);
  await newListing.save();

  req.flash("success", "Successfully added a new property!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash(
      "error",
      "Property you requested to modify does not exist or has been deleted!",
    );
    return res.redirect("/listings");
  }
  // No Cloudinary transform any more, just use the stored URL
  const originalImageUrl = listing.image.url;
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    const oldImageId = listing.image && listing.image.filename;
    listing.image = await saveImage(req.file);
    await listing.save();
    await deleteImage(oldImageId); // remove the old image from Atlas
  }

  req.flash("success", "Successfully updated the property!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id); // model hook also deletes reviews + image
  req.flash("success", "Successfully deleted the property!");
  res.redirect("/listings");
};

const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.renderBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("bookings/book", { listing });
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const bookingData = req.body.booking || {};

  // Handle checkbox boolean conversion
  bookingData.amenities = {
    ...bookingData.amenities,
    food: bookingData.amenities?.food === "on", // true if checked, false otherwise
  };

  const booking = new Booking(bookingData);
  booking.user = req.user._id;
  booking.listing = listing._id;

  await booking.save();
  req.flash("success", "Booked your holiday successfully!");
  res.redirect("/bookings/history");
};

// Change this function name:
module.exports.bookingHistory = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate(
    "listing"
  );
  res.render("bookings/history", { bookings });
};

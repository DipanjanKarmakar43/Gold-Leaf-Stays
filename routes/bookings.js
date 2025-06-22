const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookings");
const { isLoggedIn } = require("../middleware");

router.get(
  "/listings/:id/book",
  isLoggedIn,
  bookingController.renderBookingForm
);
router.post("/listings/:id/book", isLoggedIn, bookingController.createBooking);
router.get("/bookings/history", isLoggedIn, bookingController.bookingHistory);

module.exports = router;

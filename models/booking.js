const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  numPeople: {
    type: Number,
    required: true,
    min: 1,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  amenities: {
    food: {
      type: Boolean,
      default: false,
    },
  },
  paymentOption: {
    type: String,
    enum: ["prepaid", "checkin"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ————— OPTIONAL: Ensure end date is after start date —————
bookingSchema.pre("validate", function (next) {
  if (this.toDate < this.fromDate) {
    this.invalidate("toDate", "End date must be after start date");
  }
  next();
});

// ————— OPTIONAL: Virtual property for stay duration (in days) —————
bookingSchema.virtual("duration").get(function () {
  // Calculate difference in days, rounding up
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((this.toDate - this.fromDate) / msPerDay);
});

// Ensure virtuals are included when converting documents to JSON/Objects
bookingSchema.set("toObject", { virtuals: true });
bookingSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Booking", bookingSchema);

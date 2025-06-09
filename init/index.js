const mongoose = require("mongoose");
const initData = require("./data.js"); // Assuming data.js is in the same directory
const Listing = require("../models/listing.js"); // Path to your Listing model

const MONGO_URL = "mongodb://localhost:27017/airbnb-clone";

main()
  .then(() => {
    console.log("Connected to DB");
    return initDB(); // Initialize data after connection is established
  })
  .then(() => {
    console.log("Data initialization complete");
    mongoose.connection.close(); // Close the connection when done
  })
  .catch((err) => console.error(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  // Delete all existing listings
  await Listing.deleteMany({});
  console.log("Cleared all existing listings");

  // Prepare data with proper 'owner' and full 'image' object
  const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("6846ace770a66b33da83d5db"),
    image: {
      filename: obj.image.filename,
      url: obj.image.url,
    },
  }));

  // Insert the new data
  await Listing.insertMany(listingsWithOwner);
  console.log("Data was initialized");
};


initDB();

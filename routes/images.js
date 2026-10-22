const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const imageController = require("../controllers/images");

router.get("/:id", wrapAsync(imageController.serve));

module.exports = router;
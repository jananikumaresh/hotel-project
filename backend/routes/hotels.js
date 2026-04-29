const express = require("express");
const router = express.Router();
const { getAllHotels, getHotelById, createHotel } = require("../controllers/hotelController");

router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.post("/", createHotel);

module.exports = router;

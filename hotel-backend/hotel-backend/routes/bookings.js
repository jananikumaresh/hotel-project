const express = require("express");
const router = express.Router();
const {
  createBooking,
  getBookingsByGuest,
  getAllBookings,
  cancelBooking,
} = require("../controllers/bookingController");

router.get("/", getAllBookings);
router.get("/guest/:guestEmail", getBookingsByGuest);
router.post("/", createBooking);
router.put("/:id/cancel", cancelBooking);

module.exports = router;

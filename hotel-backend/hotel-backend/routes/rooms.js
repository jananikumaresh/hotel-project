const express = require("express");
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoomAvailability,
} = require("../controllers/roomController");

router.get("/", getAllRooms);           // GET /api/rooms?hotelId=xxx&available=true
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id/availability", updateRoomAvailability);

module.exports = router;

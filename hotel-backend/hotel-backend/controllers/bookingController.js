const { containers } = require("../config/cosmos");
const { v4: uuidv4 } = require("uuid");

// POST create a booking
const createBooking = async (req, res) => {
  try {
    const { roomId, guestName, guestEmail, checkIn, checkOut } = req.body;

    if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Check room availability
    const { resources: rooms } = await containers.rooms.items
      .query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: roomId }],
      })
      .fetchAll();

    if (!rooms.length)
      return res.status(404).json({ success: false, message: "Room not found" });

    const room = rooms[0];
    if (!room.isAvailable)
      return res.status(400).json({ success: false, message: "Room is not available" });

    // Calculate total price
    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * room.price;

    // Create booking
    const booking = {
      id: uuidv4(),
      roomId,
      roomType: room.type,
      hotelId: room.hotelId,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      nights,
      totalPrice,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const { resource } = await containers.bookings.items.create(booking);

    // Mark room as unavailable
    room.isAvailable = false;
    await containers.rooms.item(room.id, room.hotelId).replace(room);

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET bookings by guest email
const getBookingsByGuest = async (req, res) => {
  try {
    const { resources } = await containers.bookings.items
      .query({
        query: "SELECT * FROM c WHERE c.guestEmail = @email",
        parameters: [{ name: "@email", value: req.params.guestEmail }],
      })
      .fetchAll();

    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all bookings
const getAllBookings = async (req, res) => {
  try {
    const { resources } = await containers.bookings.items
      .query("SELECT * FROM c ORDER BY c.createdAt DESC")
      .fetchAll();
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT cancel a booking
const cancelBooking = async (req, res) => {
  try {
    const { resources } = await containers.bookings.items
      .query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: req.params.id }],
      })
      .fetchAll();

    if (!resources.length)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const booking = resources[0];
    if (booking.status === "cancelled")
      return res.status(400).json({ success: false, message: "Booking already cancelled" });

    booking.status = "cancelled";
    booking.cancelledAt = new Date().toISOString();

    const { resource } = await containers.bookings
      .item(booking.id, booking.guestEmail)
      .replace(booking);

    // Free up the room
    const { resources: rooms } = await containers.rooms.items
      .query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: booking.roomId }],
      })
      .fetchAll();

    if (rooms.length) {
      const room = rooms[0];
      room.isAvailable = true;
      await containers.rooms.item(room.id, room.hotelId).replace(room);
    }

    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBooking, getBookingsByGuest, getAllBookings, cancelBooking };

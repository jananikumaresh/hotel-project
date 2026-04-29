const { containers } = require("../config/cosmos");
const { v4: uuidv4 } = require("uuid");

// GET all rooms (optionally filter by hotelId or availability)
const getAllRooms = async (req, res) => {
  try {
    const { hotelId, available } = req.query;
    let query = "SELECT * FROM c WHERE 1=1";
    const parameters = [];

    if (hotelId) {
      query += " AND c.hotelId = @hotelId";
      parameters.push({ name: "@hotelId", value: hotelId });
    }
    if (available !== undefined) {
      query += " AND c.isAvailable = @available";
      parameters.push({ name: "@available", value: available === "true" });
    }

    const { resources } = await containers.rooms.items
      .query({ query, parameters })
      .fetchAll();

    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single room
const getRoomById = async (req, res) => {
  try {
    const { resources } = await containers.rooms.items
      .query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: req.params.id }],
      })
      .fetchAll();

    if (!resources.length)
      return res.status(404).json({ success: false, message: "Room not found" });

    res.json({ success: true, data: resources[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create room
const createRoom = async (req, res) => {
  try {
    const room = {
      id: uuidv4(),
      isAvailable: true,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await containers.rooms.items.create(room);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT update room availability
const updateRoomAvailability = async (req, res) => {
  try {
    const { resources } = await containers.rooms.items
      .query({
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: req.params.id }],
      })
      .fetchAll();

    if (!resources.length)
      return res.status(404).json({ success: false, message: "Room not found" });

    const room = resources[0];
    room.isAvailable = req.body.isAvailable;

    const { resource } = await containers.rooms
      .item(room.id, room.hotelId)
      .replace(room);

    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoomAvailability };

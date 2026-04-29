const { containers } = require("../config/cosmos");
const { v4: uuidv4 } = require("uuid");

// GET all hotels
const getAllHotels = async (req, res) => {
  try {
    const { resources } = await containers.hotels.items
      .query("SELECT * FROM c")
      .fetchAll();
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single hotel by ID
const getHotelById = async (req, res) => {
  try {
    const { resource } = await containers.hotels
      .item(req.params.id, req.params.id)
      .read();
    if (!resource) return res.status(404).json({ success: false, message: "Hotel not found" });
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST create hotel
const createHotel = async (req, res) => {
  try {
    const hotel = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    const { resource } = await containers.hotels.items.create(hotel);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllHotels, getHotelById, createHotel };

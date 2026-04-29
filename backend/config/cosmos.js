const { CosmosClient } = require("@azure/cosmos");

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const database = client.database(process.env.COSMOS_DATABASE || "hoteldb");

const containers = {
  hotels: database.container("hotels"),
  rooms: database.container("rooms"),
  bookings: database.container("bookings"),
  guests: database.container("guests"),
};

// Initialize DB — creates database and containers if they don't exist
async function initializeDB() {
  try {
    await client.databases.createIfNotExists({ id: "hoteldb" });

    const containerDefs = [
      { id: "hotels", partitionKey: "/id" },
      { id: "rooms", partitionKey: "/hotelId" },
      { id: "bookings", partitionKey: "/guestEmail" },
      { id: "guests", partitionKey: "/email" },
    ];

    for (const def of containerDefs) {
      await database.containers.createIfNotExists(def);
      console.log(`✅ Container ready: ${def.id}`);
    }

    console.log("✅ Cosmos DB initialized successfully");
  } catch (err) {
    console.error("❌ Cosmos DB init error:", err.message);
    throw err;
  }
}

module.exports = { containers, initializeDB };

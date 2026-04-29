const { AzureOpenAI } = require("@azure/openai");
const { containers } = require("../config/cosmos");

const openai = new AzureOpenAI({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_KEY,
  apiVersion: "2024-02-01",
});

const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    // Fetch available rooms to give AI context
    const { resources: availableRooms } = await containers.rooms.items
      .query("SELECT * FROM c WHERE c.isAvailable = true")
      .fetchAll();

    const roomSummary = availableRooms
      .map((r) => `Room ID: ${r.id} | Type: ${r.type} | Price: ₹${r.price}/night | Hotel: ${r.hotelId}`)
      .join("\n");

    const systemPrompt = `You are a helpful hotel booking assistant for a hotel management system.
You help guests find rooms, check availability, and make bookings.

Currently available rooms:
${roomSummary || "No rooms currently available."}

When a guest wants to book:
- Ask for their name, email, check-in date, check-out date
- Suggest suitable rooms based on their needs
- Confirm the booking details before finalizing
- Be friendly, concise, and helpful

Always respond in a warm, professional tone.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    res.json({
      success: true,
      data: {
        reply,
        role: "assistant",
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { chatWithAssistant };

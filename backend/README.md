# 🏨 Hotel Management Backend API

Node.js + Express backend for the Hotel Management App, deployed on Azure Kubernetes Service (AKS).

## Tech Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: Azure Cosmos DB (NoSQL)
- **AI**: Azure OpenAI (GPT-4)
- **Container**: Docker → Azure Container Registry → AKS

## Project Structure
```
hotel-backend/
├── server.js               # Entry point
├── config/
│   └── cosmos.js           # Cosmos DB client & init
├── controllers/
│   ├── hotelController.js
│   ├── roomController.js
│   ├── bookingController.js
│   └── chatController.js   # Azure OpenAI chatbot
├── routes/
│   ├── hotels.js
│   ├── rooms.js
│   ├── bookings.js
│   └── chat.js
├── Dockerfile
└── .env.example
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/hotels` | List all hotels |
| GET | `/api/hotels/:id` | Get hotel by ID |
| POST | `/api/hotels` | Create hotel |
| GET | `/api/rooms` | List rooms (filter by hotelId, available) |
| GET | `/api/rooms/:id` | Get room by ID |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/:id/availability` | Update room availability |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings/guest/:email` | Get bookings by guest |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/chat` | AI chatbot |

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in your Azure credentials
cp .env.example .env

# 3. Run locally
npm run dev
```

## Environment Variables
See `.env.example` for all required variables.

## Docker

```bash
# Build
docker build -t hotel-backend .

# Run
docker run -p 3000:3000 --env-file .env hotel-backend
```

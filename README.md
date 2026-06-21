#  RoadSoS — Road Safety AI Emergency Response System

> **Minimize the golden hour delay. Connect victims to help in seconds.**

Built for the **CoERS IIT Madras Hackathon 2026** · Submission Deadline: May 2026

---

##  What is RoadSoS?

RoadSoS is a location-aware emergency response web application that bridges the critical gap between a road accident and the arrival of professional help. When every second counts, RoadSoS:

- **Finds** the nearest trauma centers, ambulances, and police stations using live GPS
- **Dispatches** automated SOS alerts with your live location to pre-saved emergency contacts
- **Guides** you through immediate trauma stabilization using an ultra-low-latency First-Aid AI

---

##  Core Features

| Feature | Description | Tech |
|---|---|---|
|  Live GPS Capture | Instant hardware-level coordinates | HTML5 Geolocation API |
|  Multi-Agency Search | Parallel radius-based search across trauma centers, ambulances & police | Google Places API |
|  Automated SOS Dispatch | One-click SMS with live Maps link to emergency contacts | Twilio API |
|  First-Aid AI Terminal | Zero-fluff, 3-step trauma stabilization instructions | Groq API (Llama 3.1 8B) |

---

##  Project Structure

```
roadsos/
├── client/                  # Vite + React Frontend (Port 5173)
│   ├── src/
│   │   ├── App.jsx           # Dual-pane dashboard
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/                  # Node.js + Express Backend (Port 5000)
│   ├── index.js              # Express entry point
│   ├── routes/
│   │   ├── places.js         # Google Places API proxy
│   │   ├── sos.js            # Twilio SOS dispatch engine
│   │   └── firstaid.js       # Groq AI endpoint
│   └── .env                  # API keys (never commit this)
│
├── .gitignore
├── package.json
└── vercel.json              # Unified deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- API keys for: Google Maps Platform, Twilio, Groq

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/roadsos.git
cd roadsos
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment variables

Create a `.env` file inside `/server`:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
EMERGENCY_CONTACT_NUMBER=+91xxxxxxxxxx
GROQ_API_KEY=your_groq_key
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd server && node index.js

# Terminal 2 — Frontend
cd client && npm run dev
```

Open `http://127.0.0.1:5173`

---

## 🔌 API Endpoints

### `GET /api/health`
Server heartbeat check.

```json
{ "status": "RoadSoS backend is live" }
```

---

### `POST /api/sos`
Core dispatch engine. Finds nearest facility + fires Twilio SMS.

**Request body:**
```json
{ "lat": 26.8467, "lng": 80.9462 }
```

**Response:**
```json
{
  "nearest_hub": "Trauma Centre Name",
  "distance": "1.2 km",
  "map_link": "https://maps.google.com/?q=...",
  "sms_sid": "SMxxxxxxxxxxxxxxxx"
}
```

---

### `POST /api/chat`
First-Aid AI terminal. Returns exactly 3 actionable stabilization steps.

**Request body:**
```json
{ "message": "Person is unconscious with head bleeding" }
```

**Response:**
```json
{
  "reply": "1. Do not move the patient...\n2. Apply firm pressure...\n3. Keep airway clear..."
}
```

---

## 📦 Dependencies

### Backend
```
express
dotenv
@googlemaps/google-maps-services-js
twilio
groq-sdk
cors
```

### Frontend
```
react
react-dom
vite
```

---

## 🔒 Project Assumptions

1. User has granted GPS permissions to the browser
2. Stable internet connection available at the time of SOS trigger
3. Emergency contact numbers are pre-configured in `.env`
4. Google Places database accuracy for facility locations
5. Twilio trial account numbers must be verified before receiving SMS

---

## 🏗️ Architecture Overview

```
[User Browser]
     │
     ├─── GPS Coordinates ──────────────────────────────┐
     │                                                   ▼
     ├─── POST /api/sos ──► [Express Server] ──► Google Places API
     │                              │                    │
     │                              ├──► Twilio SMS ◄────┘
     │                              │    (with Maps link)
     │                              │
     └─── POST /api/chat ──► [Groq LLM] ──► 3-step first-aid response
```

---

## 🎯 Hackathon Context

**Event**: CoERS National Road Safety Hackathon 2026  
**Host**: IIT Madras  
**Problem Statement**: Reduce golden hour fatality rates through technology  

---

## 🛣️ Roadmap (Post-Hackathon)

- [ ] Multi-agency parallel dispatch (`Promise.all` across trauma/ambulance/police)
- [ ] Golden Hour countdown timer with adaptive AI instructions
- [ ] PWA with offline-first cached first-aid protocols
- [ ] Real-time ETA from Google Directions API
- [ ] Contact management UI (remove hardcoded `.env` dependency)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built under pressure. For people under pressure.</strong><br/>
  RoadSoS · IIT Madras Hackathon 2026
</div>

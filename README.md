# 🚑 Aapat Sathi (आपात साथी)

**AI-Powered Emergency Dispatch & Healthcare Routing System for Nepal**

Aapat Sathi is a multi-channel emergency response system built to intelligently triage patients and route them to the most suitable healthcare facility based on real-time availability, required medical capabilities, and geographic proximity. 

When every second counts, Aapat Sathi ensures patients aren't sent to hospitals that lack the necessary equipment (like ICU beds, trauma surgeons, or oxygen) or are currently at full capacity.

## ✨ Core Features

- 🧠 **AI Triage Engine:** Powered by OpenRouter AI, the system parses natural language distress messages (e.g. "Severe chest pain near New Road") to extract the exact medical capabilities required (e.g., Cardiology, ICU, Oxygen) and assigns an urgency level (CRITICAL, HIGH, MEDIUM, LOW).
- 📍 **Smart Geocoding:** Automatically extracts rough location data from user messages and converts them into GPS coordinates using the OpenStreetMap Nominatim API.
- 🏥 **Advanced Hospital Scoring Engine:** Matches patients to hospitals using a weighted algorithm considering:
  - Geographic Proximity (Haversine distance)
  - Real-time ICU & Bed Availability
  - Active Emergency Queues
  - Medical Capabilities (JSONB filtering)
- 🚑 **Instant Ambulance Dispatch:** Automatically queries and returns the contact information of the nearest available ambulances to the emergency site.
- 📱 **Multi-Channel Accessibility:** 
  - **Web Portal:** React-based emergency request interface.
  - **Telegram Bot:** A fully featured Telegram bot for emergency reporting via text and voice notes.
  - **SMS Support:** Fallback low-bandwidth SMS integration.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS + Lucide Icons
- **Language:** TypeScript

### Backend
- **Framework:** Node.js with Express.js
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Drizzle ORM
- **AI Integration:** OpenRouter (via OpenAI SDK)
- **Bot Framework:** Telegraf (Telegram Bot API)

## 🚀 How It Works (The Orchestrator Workflow)

1. **Ingestion:** An emergency is reported via the Web UI or Telegram.
2. **AI Analysis:** The message is sent to OpenRouter to extract symptoms, urgency, required capabilities, and location.
3. **Geocoding:** If exact GPS coordinates aren't provided, the extracted location string is geocoded.
4. **Matching:** The system runs a SQL Haversine query against the database of active hospitals, filtering for those that have the required capabilities and sorting by the availability score.
5. **Dispatch:** The primary hospital is selected, and alternative hospitals + nearest available ambulances are packaged into the response.
6. **Alerting:** The user receives immediate instructions and contact info, while the primary hospital receives an inbound alert.

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database (or a Supabase project)
- Telegram Bot Token (from BotFather)
- OpenRouter API Key

### 1. Clone & Install
\`\`\`bash
git clone https://github.com/yourusername/aapat-sathi.git
cd aapat-sathi

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
\`\`\`

### 2. Environment Variables
Create a \`.env\` file in the **backend** directory:
\`\`\`env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="your_jwt_secret"
OPENROUTER_API_KEY="your_openrouter_api_key"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
PORT=5000
\`\`\`

Create a \`.env\` file in the **frontend** directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
\`\`\`

### 3. Run the Application
Start the backend server:
\`\`\`bash
cd backend
npm run dev
\`\`\`

Start the frontend application:
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The web portal will be available at \`http://localhost:3000\`.

## 🗄️ Database Seeding

To populate your database with initial sample data (Hospitals in Pokhara & Kathmandu, Ambulances, etc.):
\`\`\`bash
cd backend
npm run db:seed
\`\`\`

---
*Built for the Hackathon to save lives through intelligent dispatching.*

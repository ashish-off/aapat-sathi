# Hackathon TODO — Backend

This plan is optimized for hackathon speed: building the core database and services first, followed by the AI matching engine, and finally the webhooks for Telegram/SMS.

## Phase 1: Database & Core Models
- [x] Set up Drizzle ORM (`drizzle.config.js`, `db/index.js`) and connect to PostgreSQL
- [x] Create schema for `healthcare_providers` and `provider_availability`
- [x] Create schema for `ambulances`
- [x] Create schema for `users` (provider staff/admin)
- [x] Create schema for `emergency_requests` and `emergency_updates`
- [x] Create schema for `notifications`
- [ ] Run `npx drizzle-kit push` to sync schema to DB

## Phase 2: Auth & Provider Management
- [x] Implement auth controllers & services (JWT, bcryptjs)
- [x] Build global error handler and `requireAuth` middleware
- [x] Build public endpoint for provider registration
- [x] Build protected endpoints for provider staff to update their status (Open/Full/Limited) and availability

## Phase 3: AI & Matching Pipeline
- [x] Integrate Gemini/OpenAI for triage extraction (extracting urgency, capabilities, symptoms)
- [x] Implement matching service (Haversine distance + JSONB capability containment query)
- [x] Build the core orchestration service (Triage -> Match -> Save Request)
- [x] Create a test REST endpoint to verify the orchestrator

## Phase 4: Webhooks & Integrations
- [ ] Set up Telegram webhook (handle text, integrate Whisper for voice notes)
- [ ] Set up Twilio SMS webhook
- [ ] Wire webhooks into the core orchestration service
- [ ] Implement outbound notification service (SMS to family, Telegram to matched provider)

## Phase 5: Polish & Frontend Support
- [ ] Build public API for the frontend landing page (search/browse providers)
- [ ] Finalize `.env` setup instructions and ensure `nodemon` restarts work smoothly

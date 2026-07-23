# Architecture — Aapat Sathi

## Tech stack

**Backend**
- Node.js + Express 5
- Plain JavaScript, ES modules (`"type": "module"` — no TypeScript in this project)
- PostgreSQL as the database
- Drizzle ORM (`drizzle-orm/node-postgres`), schema-first, split per table
- `drizzle-kit push` for schema sync (no migration files — hackathon speed, see note below)
- JWT auth via `jsonwebtoken`, stored as httpOnly cookie (not localStorage)
- Passwords hashed with `bcryptjs`
- `nodemon` for dev reload, config in `nodemon.json`
**Frontend**
- Next.js (App Router)
- Tailwind CSS
- Server Components + Server Actions where practical

**AI / external services**
- Gemini or OpenAI SDK for triage extraction (structured JSON output)
- Whisper for voice note transcription (Telegram voice messages)
- Telegram Bot API (`telegraf` or raw webhooks)
- Twilio for inbound/outbound SMS
- OpenStreetMap Nominatim for geocoding plain-text locations from SMS

## Folder structure (backend)

```text
backend/
├── src/
│   ├── server.js               # entry point, starts the HTTP server
│   ├── app.js                  # Express app config, middleware, route mounting
│   ├── db/
│   │   ├── index.js            # Drizzle + pg Pool connection
│   │   └── schema/
│   │       ├── index.js        # barrel export of all tables
│   │       ├── providers.js
│   │       ├── providerAvailability.js
│   │       ├── ambulances.js
│   │       ├── users.js
│   │       ├── emergencyRequests.js
│   │       ├── emergencyUpdates.js
│   │       └── notifications.js
│   ├── controllers/            # thin — parse req, call service, shape res
│   │   ├── authController.js
│   │   └── providerController.js
│   ├── services/               # fat — business logic, DB queries live here
│   │   ├── authService.js
│   │   ├── providerService.js
│   │   └── matchingService.js
│   ├── middlewares/
│   │   └── auth.js             # requireAuth, requireRole
│   └── routes/
│       ├── index.js            # barrel router, mounts all route files under /api
│       ├── authRoutes.js
│       └── providerRoutes.js
├── drizzle.config.js
├── nodemon.json
└── .env
```


**Pattern: thin controller / fat service.** Controllers only parse the request, call a service function, and shape the response. All business logic and DB queries live in services. This keeps logic testable and reusable (e.g. the matching service will be called from both a webhook and a plain REST endpoint).

## Database schema (7 tables)

- **healthcare_providers** — the facility itself: name, type, location, capabilities (JSONB array), live status (OPEN/FULL/LIMITED)
- **provider_availability** — 1:1 with a provider: bed counts, ambulance counts, queue length (separated from the provider table since it updates far more frequently)
- **ambulances** — vehicle + driver info, optionally linked to a provider (nullable — independent ambulances allowed)
- **users** — provider staff accounts, nullable `providerId` (null = platform admin), role-based (`PROVIDER_STAFF`, `ADMIN`)
- **emergency_requests** — one row per incoming emergency: raw message, AI-extracted urgency/symptoms/capabilities, location, matched provider + ambulance, status lifecycle
- **emergency_updates** — audit trail of status changes on a request
- **notifications** — log of every message sent out (to patient, provider staff, or driver) and its delivery status

Full field-level detail lives in the schema files themselves (`db/schema/*.js`) — this doc stays high-level so it doesn't go stale as fields evolve.

## Core data flow

Telegram / SMS message received (webhook)
↓
AI triage service extracts: urgency, required capabilities, symptom summary
↓
Matching service: Haversine distance + JSONB capability containment query
→ finds nearest OPEN provider with ALL required capabilities
→ falls back to ANY-match if no exact match found
↓
emergency_requests row created/updated with match result
↓
Reply sent to family (facility, map link, ambulance contact) — logged in notifications
Alert sent to matched provider's Telegram group — logged in notifications


This flow is built as one orchestrating service function first (testable via a plain POST endpoint), then wired into the Telegram and SMS webhooks separately. Both webhooks are thin adapters that convert their channel's payload into a common shape and call the same orchestration function — no duplicated triage/matching logic between channels.

## Auth model

- JWT signed on login, stored as httpOnly cookie (`secure` in production, `sameSite: lax`)
- `requireAuth` middleware decodes the cookie into `req.user` (`{ id, role, providerId }`)
- `requireRole(...)` middleware for role-gated routes
- Provider staff can only mutate their own provider's data — enforced by comparing `req.user.providerId` to the route param, not by trusting the client
- Public routes (provider search, provider detail, provider registration) require no auth — only status/availability *updates* are protected

## Key architectural decisions & why

- **No TypeScript** — plain JS with ES modules, chosen for hackathon build speed over type safety
- **`drizzle-kit push` instead of migrations** — schema changes apply directly to the DB with no `.sql` migration history. Fine for hackathon iteration; would switch to `generate` + `migrate` if this became a real production project
- **Availability separated from provider table** — availability (bed counts, queue) changes constantly; keeping it in its own table avoids bloating update payloads on the core provider record
- **Strict-match-then-fallback in matching service** — a real emergency shouldn't return zero results just because no provider has every single required capability; fallback relaxes to ANY-match rather than failing
- **Two intake channels converge on one pipeline** — Telegram and SMS are just adapters; all triage/matching/dispatch logic is channel-agnostic and lives once, in services

## What's explicitly out of scope
See `project-overview.md` → Non-goals.
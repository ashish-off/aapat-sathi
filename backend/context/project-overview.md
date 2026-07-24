# Project overview — Aapat Sathi

## What this is
Aapat Sathi ("Emergency Companion") is an emergency dispatch and routing platform for Nepal. It solves a specific problem: when someone has a medical emergency, they often don't know which nearby hospital can actually treat it — the right specialty, an open ICU bed, ambulance availability — and calling around under panic wastes critical time.

## Core idea
A family in crisis sends one message — via Telegram (text or voice) or plain SMS — describing the emergency and location. The system:
1. Uses AI to extract urgency level and required medical capabilities from the message
2. Finds the nearest healthcare provider that has those capabilities AND is currently open
3. Replies to the family with the facility name, a map link, healthcare services details, and an ambulance contact
4. Simultaneously alerts that provider's ER staff via a Telegram group, so they're expecting the patient

## Who uses it
- **Patients' families** (public, no account) — send emergency messages via Telegram or SMS, get routed to help
- **Healthcare provider staff** (registered accounts) — manage their facility's live status (Open/Full/Limited) and bed/ambulance availability from a simple dashboard, and see incoming emergency requests assigned to them as well as get notification on their telegram id.
- **General public** (no account) — can search/browse the provider directory on the landing page anytime, not just during an emergency (e.g. "what hospitals near me have a trauma center")

## Why this matters (context)
Built for a hackathon, but grounded in a real gap: many hospitals in Nepal don't publish live capacity or capability data anywhere accessible. Families default to word-of-mouth or driving to the nearest hospital blind, which can mean arriving somewhere that can't actually treat the emergency and losing time transferring elsewhere.

## Two intake channels, one reason
- **Telegram** — richer input (voice notes, live location), for people with data/smartphones
- **SMS** — works on any phone, no app or data needed, critical for lower-connectivity areas or older phones

Both funnel into the same triage → matching → dispatch pipeline. The channel is just how the message arrives; everything downstream is identical.

## Non-goals (for this build)
- Not a full hospital management system — no billing, no EHR, no patient records beyond the emergency request log
- Not building ambulance GPS live-tracking — ambulance data is manually updated by provider staff, not device-tracked
- Not handling non-emergency appointment booking

## Current build stack
- Backend: Node.js, Express 5, PostgreSQL, Drizzle ORM (plain JS, ES modules)
- Frontend: Next.js, Tailwind CSS
- AI: Gemini/OpenAI for triage extraction, Whisper for voice transcription
- Channels: Telegram Bot API, Twilio SMS
- Geocoding: OpenStreetMap Nominatim

See `architecture.md` for full technical detail and `build-plan.md` for current build sequence.
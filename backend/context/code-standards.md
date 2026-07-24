# Code standards — Aapat Sathi

Conventions to follow across backend and frontend. An AI assistant working on this codebase should default to these patterns without being re-told each time.

## General philosophy

- Optimize for hackathon execution speed, but never at the cost of unreadable code — collaborators (human or AI) need to onboard into any file in under a minute
- Prefer explicit over clever — no unnecessary abstraction, no premature generalization
- Build and review **one file at a time**. Don't generate a sprawling multi-file change in one shot unless explicitly asked — smaller, reviewable increments are the default
- Give honest architectural feedback, not agreement by default. If a requested approach has a real tradeoff or a better alternative, say so before implementing — don't silently implement something suboptimal to avoid friction

## Backend patterns

### Thin controller / fat service
- **Controllers**: parse `req`, validate presence of required fields, call one service function, shape the response. No DB queries, no business logic in controllers.
- **Services**: all business logic and DB queries live here. Services throw `Error` objects with a `.status` property for expected failures (not found, conflict, invalid input) — never send a response directly from a service.
- **Routes**: only wire `path + method → controller function` (+ middleware). No logic.

### Error handling
- Services throw, controllers catch and `next(err)`
- One global error-handling middleware in `app.js` formats all error responses consistently: `{ error: message }`
- Never let an unhandled error crash the process silently — always route through `next(err)`

### Naming
- Files: camelCase (`providerService.js`, `authController.js`)
- DB tables: snake_case (Postgres convention) — `healthcare_providers`, `emergency_requests`
- DB columns: snake_case in the actual table, camelCase in the Drizzle schema object (Drizzle handles the mapping) — e.g. `providerType: varchar("provider_type", ...)`
- Route paths: kebab-case, plural nouns for resources (`/api/providers`, `/api/emergency-requests`)
- Functions: verbNoun (`createProvider`, `findMatchingProviders`, `updateProviderStatus`)

### Validation
- Validate required fields explicitly in the controller with a clear 400 response — don't rely on DB constraints alone to catch missing input
- Keep validation minimal and inline for hackathon speed — no schema validation library unless a form gets complex enough to justify it

### Auth & authorization
- Ownership checks (e.g. "can this user update this provider") happen in the controller, comparing `req.user.providerId` against the route param — never trust a client-supplied ID for authorization
- Auth middleware only decodes and attaches `req.user` — it doesn't do ownership checks itself, keep that per-route

## Frontend patterns

### Forms
- **Prefer FormData-based uncontrolled forms** over controlled `useState`-per-field forms, especially for straightforward create/update forms (provider registration, availability updates). Less re-render overhead, less boilerplate, pairs naturally with Server Actions.
- Reserve controlled state for fields that need live validation feedback, conditional rendering, or derived UI (e.g. a multi-select capabilities picker)

### Components
- Server Components by default; only mark `"use client"` when the component needs interactivity (state, effects, event handlers)
- Prefer Server Actions for mutations over client-side `fetch` calls to API routes, where practical
- Keep components scoped to one responsibility — a dashboard page composes smaller pieces (`StatusToggle`, `AvailabilityForm`, `RequestsList`) rather than one large file

### Data fetching
- Server Components fetch directly (DB or internal API) where possible — avoid unnecessary client-side fetching waterfalls
- Client-side fetching (e.g. polling for live dashboard updates) uses plain `fetch` with clear loading/error states — no heavier data-fetching library unless polling complexity demands it

### Styling
- Tailwind CSS utility classes directly in markup — no separate CSS files unless a pattern repeats enough to warrant extraction
- Follow `ui-tokens.md` for colors, spacing, and type scale once that file exists — don't invent ad hoc values

## Review expectations

- When asked to build a feature, confirm scope before generating large amounts of code if the request is ambiguous
- Flag any assumption made explicitly (e.g. "I'm assuming X, correct me if not") rather than silently guessing
- After implementing, state what was tested/testable and what still needs manual verification — don't imply something works if it hasn't been run
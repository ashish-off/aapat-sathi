# Library docs — Aapat Sathi

Project-specific notes on the libraries in use. This is not general documentation — it's the gotchas and conventions specific to *this* codebase, so an AI assistant (or future you) doesn't relearn them by trial and error.

## Module system

- `package.json` has `"type": "module"` — every file uses `import`/`export`, never `require`
- Always include the `.js` extension in relative imports (`import { db } from "../db/index.js"`) — ES modules require it, unlike CommonJS

## Environment variables

- We use Node's native `--env-file=.env` flag, **not** `dotenv.config()` in application code
- `dev` and `start` scripts both pass `--env-file=.env`
- `nodemon` does **not** support a `.js` config file — only `nodemon.json`. There is no such thing as `nodemon.config.js`
- The `--env-file` flag must live inside `nodemon.json`'s `"exec"` string (`"exec": "node --env-file=.env src/server.js"`), since nodemon spawns its own process
- **Exception:** `drizzle.config.js` still needs `dotenv.config()` manually — `drizzle-kit` is a separate CLI process and does not inherit Node's `--env-file` flag from the app

## Drizzle ORM

- Schema is split per table under `src/db/schema/`, barrel-exported from `schema/index.js`
- Connection setup: `drizzle-orm/node-postgres` + `pg.Pool`, not the raw `pg.Client`
- **JSONB queries need raw `sql` template literals** — Drizzle's query builder doesn't have first-class helpers for JSONB containment:
  - "Has ALL of these capabilities": `sql`${table.capabilities} @> ${JSON.stringify(arr)}::jsonb``
  - "Has ANY of these capabilities": `sql`${table.capabilities} ?| ARRAY(SELECT jsonb_array_elements_text(${JSON.stringify(arr)}::jsonb))``
  - Always cast the JSON string to `::jsonb` explicitly — Postgres won't infer it from a parameterized string
- **Haversine distance** is also raw SQL (`db.execute(sql`...`)`) — no ORM abstraction for geo math, we compute it inline in the query and alias it `distance_km`
- **Schema changes: use `npx drizzle-kit push`, not migration files.** This project intentionally skips `generate`/`migrate` for hackathon speed — see `architecture.md` for the tradeoff. `push` can be destructive on type changes/NOT NULL constraints if data already violates them — eyeball the CLI diff prompt before confirming once real data exists
- `db.execute(sql\`...\`)` returns `{ rows: [...] }` — access results via `.rows`, not the return value directly

## Express 5

- Note the major version — Express 5 changed some behaviors from v4 (e.g. route matching, removed some deprecated methods). If an AI assistant suggests v4-era patterns that don't work, check the Express 5 migration guide rather than assuming a typo
- Global error handler must have exactly 4 params `(err, req, res, next)` — Express uses arity to detect it as an error handler, unchanged from v4

## Auth stack

- `bcryptjs` (pure JS, not `bcrypt`) — chosen to avoid native compilation issues during hackathon setup
- `jsonwebtoken` for signing/verifying — payload shape is always `{ id, role, providerId }`, kept minimal and consistent everywhere it's decoded
- `cookie-parser` required as middleware in `app.js` for `req.cookies` to exist — without it, `requireAuth` middleware will silently see `undefined`
- Cookie options are centralized as a `COOKIE_OPTIONS` const in `authController.js` — `httpOnly: true`, `secure` only in production, `sameSite: "lax"`. Reuse this exact object for both setting and clearing the cookie, or `clearCookie` won't actually clear it (mismatched options = silent no-op in some browsers)

## nodemon

- Config file: `nodemon.json` at the backend root, auto-loaded when running bare `nodemon` (no args)
- Watches `src/` only (not `node_modules`, not `drizzle/` output) for faster restarts
- `delay: 300` debounces rapid saves

## General conventions across all libraries

- Prefer explicit, readable code over clever one-liners — hackathon collaborators (including AI assistants) need to onboard fast
- Every service function that can fail in an expected way (not found, conflict, etc.) throws an `Error` with a `.status` property, caught by controllers and passed to `next(err)` → handled by the global error middleware. Don't `res.status().json()` errors directly inside services.
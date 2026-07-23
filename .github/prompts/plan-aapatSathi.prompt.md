## Plan: Aapat Sathi Demo Build

TL;DR: Build a narrow emergency-healthcare demo only. Backend handles hospital lookup, ranking, and prompt assembly. Frontend handles the intake and recommendation UI. The AI assistant only reasons over hospital data the backend injects. No auth, no payments, no notifications, no dashboards.

**Goal**

- Show a believable emergency triage flow for Nepal.
- Recommend only verified hospitals from the supplied database context.
- Keep the demo fast, calm, and easy to explain in a hackathon.

**Scope lock**

- In scope: emergency intake, hospital ranking, availability request flow, assistant response formatting, basic first-aid guidance, UI polish for demo.
- Out of scope: authentication, email verification, password reset, JWT refresh tokens, admin roles, OTP login, payment, notifications, complex dashboards, internet search, diagnosis, prescriptions, or any hospital invented by the AI.

**Build order**

1. Define the minimum data contract.
   - Fields needed from the user: what happened, who it is for, age range or exact age, consciousness, timing, main symptom, location or district if available.
   - Fields needed from hospitals: name, district, distance, travel time, emergency department, ICU, NICU, trauma center, cardiology, neurology, orthopedics, general surgery, CT scan, MRI, blood bank, laboratory, pharmacy, phone, available specialists.
   - Response shape the assistant must follow: emergency summary, immediate recommendation, recommended hospitals, reason for recommendation, immediate actions, important reminder.
   - Safety rules to freeze early: never invent hospitals, never search the internet, never claim certainty, never diagnose, never output data not present in backend context.

2. Build the backend orchestration.
   - Create the API route or service layer for one emergency request flow.
   - Fetch hospitals from PostgreSQL using the supplied user context and ranking rules.
   - Rank by capability first, then emergency suitability, then distance, then travel time.
   - Build a prompt that injects only the selected hospital records and the user emergency summary.
   - Return structured output for the frontend: triage summary, ranked hospitals, explanation, and next action.
   - Add the no-match branch: if no hospital fits, tell the user to contact the nearest emergency facility immediately.
   - Keep the backend minimal: no auth, no accounts, no payment, no notifications, no admin tools.

3. Build the frontend demo shell.
   - Replace the starter page with a clear emergency intake form or chat-style intake panel.
   - Show the assistant output in stable blocks so the judge can read it quickly.
   - Render a ranked hospital list with why each result was chosen.
   - Show a compact hospital detail area for phone, distance, district, and critical capabilities.
   - Make the layout mobile-safe, low-clutter, and readable in a demo room.

4. Add assistant behavior rules.
   - Use short follow-up questions if the emergency details are incomplete.
   - Keep language calm, practical, and short during urgent cases.
   - If the emergency type is unclear, ask the smallest useful question set before ranking hospitals.
   - If the user asks for first aid, provide only widely accepted guidance and always tell them to seek professional help immediately.
   - If availability data comes back from a hospital, explain it plainly and do not overstate certainty.

5. Prepare demo data and fallback paths.
   - Seed or mock enough hospital records to demonstrate a cardiac case, trauma case, stroke case, pregnancy case, and no-match case.
   - Make sure at least one result shows why capability outranks pure distance.
   - Make the fallback path obvious when hospital data is missing or insufficient.
   - Remove the default Next.js starter content so the demo feels like a real product.

6. Validate the slice.
   - Run frontend lint.
   - Run frontend build.
   - Test one normal emergency, one incomplete-input case, and one no-match case.
   - Verify the assistant only repeats hospitals and capabilities provided by backend context.
   - Check the UI on desktop and mobile for obvious next steps and quick readability.

**Todo list**

- Lock the data contract and assistant rules.
- Decide the backend request/response format.
- Build the hospital ranking function.
- Build the prompt assembly step.
- Build the frontend emergency intake screen.
- Build the ranked recommendation display.
- Add the no-match and incomplete-input states.
- Add simple first-aid guidance text.
- Add demo seed data or mock data.
- Run lint, build, and flow checks.

**Relevant files**

- `c:\Users\lenovo\Desktop\Aapat sathi\frontend\app\page.tsx` — replace the starter landing page with the emergency intake and recommendation UI.
- `c:\Users\lenovo\Desktop\Aapat sathi\frontend\app\layout.tsx` — update metadata, page title, and app shell.
- `c:\Users\lenovo\Desktop\Aapat sathi\frontend\app\globals.css` — set the visual system for a calm emergency-care theme.
- `c:\Users\lenovo\Desktop\Aapat sathi\frontend\README.md` — note the demo flow and run steps if needed.
- `c:\Users\lenovo\Desktop\Aapat sathi\backend\` — add API, database access, ranking, and assistant orchestration.

**Acceptance checks**

- The backend never returns a hospital not present in the supplied database context.
- The assistant never outputs unsupported medical claims.
- The frontend clearly shows the recommended hospital and the reason it was chosen.
- The no-match path is visible and tells the user to go to the nearest emergency facility.
- The demo can be explained in one minute without referencing excluded features.

**Decisions**

- The AI has no direct database access; the backend must fetch and inject hospital context.
- The demo should optimize for credibility and speed, not breadth.
- Excluded features stay excluded for the hackathon build.

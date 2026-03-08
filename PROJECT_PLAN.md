# Sortify — Build Plan

Tech stack: **SvelteKit** · **Custom CSS** (no Tailwind) · **Supabase** (auth + DB) · **Anthropic API** (streaming)

Design: flat, minimal — white/light gray backgrounds, black/dark gray text, one green accent color with a darker shade for hover states. No gradients, minimal shadows.

Language: **Swedish throughout.** All UI copy, labels, buttons, error messages, disclaimers, and crisis resources in Swedish. The AI responds in Swedish by default (system prompts must explicitly instruct this). English only if the user specifically switches or requests it.

---

## Design System Setup

- [ ] **1.** Create CSS custom properties file with the full color palette:
  - `--white`, `--gray-50` through `--gray-900`, `--black`
  - `--accent` (green, e.g. `hsl(152, 56%, 40%)`), `--accent-hover` (darker), `--accent-subtle` (light tint for backgrounds)
  - `--danger` (for crisis/safety UI), `--danger-hover`
  - Semantic tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-interactive`, `--color-interactive-hover`
- [ ] **2.** Define base typography: font stack, size scale, line heights, heading styles.
- [ ] **3.** Define spacing scale, border-radius tokens, and transition defaults.
- [ ] **4.** Build reusable CSS component classes: buttons (primary, secondary, ghost), inputs, cards, layout containers.

---

## Phase 0 — Vertical Slice (Week 1)

_Goal: one complete flow end-to-end — auth → voice select → chat → takeaway → library._

### Project scaffolding

- [ ] **5.** Initialize SvelteKit project with TypeScript.
- [ ] **6.** Set up project structure: `lib/`, `routes/`, `styles/`, `lib/server/`, `lib/components/`.
- [ ] **7.** Create global CSS files (reset, variables, typography, utilities) and import into root layout.
- [ ] **8.** Set up Supabase project: create database, get API keys, configure `.env`.
- [ ] **9.** Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`.

### Auth

- [ ] **10.** Set up Supabase client (browser + server) using `@supabase/ssr`.
- [ ] **11.** Implement email magic link auth flow:
  - Login/signup page with email input
  - Auth callback route to handle magic link redirect
  - Session management in hooks (`hooks.server.ts`)
- [ ] **12.** Add auth guard: redirect unauthenticated users from app routes to login.
- [ ] **13.** Add sign-out button in app header/nav.

### Database schema + RLS

- [ ] **14.** Create `sessions` table with all fields from the data model (id, user_id, voice, title, status, started_at, ended_at, turn_count, safety_flag, safety_type, model, prompt_version, created_at).
- [ ] **15.** Create `messages` table (id, session_id, role, content, token_count, latency_ms, created_at).
- [ ] **16.** Create `takeaways` table (id, session_id, format, content, version, regenerated_from_message_id, created_at).
- [ ] **17.** Enable RLS on all tables. Write policies: users can only CRUD their own data (join through sessions.user_id).
- [ ] **18.** Validate RLS with two test accounts — confirm user A cannot read user B's data.

### Voice selection

- [ ] **19.** Create voice selection page/component with one voice ("Gentle") for the slice.
- [ ] **20.** On voice select: create a new session record in Supabase, then navigate to chat view.

### Chat — streaming + persistence

- [ ] **21.** Build the chat UI component: message list (user/assistant bubbles), text input with send button, auto-scroll.
- [ ] **22.** Create `POST /api/chat` server endpoint:
  - Receive `sessionId` + `message`
  - Load session + message history from Supabase
  - Run safety check on user message (step 25)
  - Build system prompt (base prompt + voice overlay + session stage context)
  - Call Anthropic API with streaming enabled
  - Return streamed response via SSE or ReadableStream
- [ ] **23.** Persist messages: save user message before API call, save assistant message after stream completes. Update `turn_count`.
- [ ] **24.** Wire frontend to stream: display assistant response token-by-token as it arrives.

### Safety check

- [ ] **25.** Implement safety classifier on each user message:
  - Keyword/pattern-based first pass (escalate to LLM check if flagged)
  - If crisis detected: set `safety_flag` + `safety_type` on session, return crisis response template instead of normal LLM call
- [ ] **26.** Build crisis response UI: empathetic message + resource card with crisis hotline numbers + prompt to contact trusted person.
- [ ] **27.** Test: verify crisis keywords trigger safety flow and block normal chat continuation.

### Takeaway generation

- [ ] **28.** Add wrap-up trigger: after minimum turn threshold (e.g. 5 turns), show a "Ready to wrap up?" prompt/button.
- [ ] **29.** Create `POST /api/takeaway` endpoint:
  - Receive `sessionId` + `format`
  - Load full session transcript
  - Call Anthropic API with takeaway generation prompt
  - Save takeaway to DB, update session status to `completed`
- [ ] **30.** Build takeaway format selection UI (one format for slice: "Letter to Self").
- [ ] **31.** Display generated takeaway with a "Save to library" action.

### Library

- [ ] **32.** Create `GET /api/sessions` endpoint: return user's sessions (title, date, status, voice).
- [ ] **33.** Build library list view: show saved sessions as cards/rows.
- [ ] **34.** Create `GET /api/sessions/[id]` endpoint: return session + messages + takeaway.
- [ ] **35.** Build session detail view: display conversation + takeaway.

### Slice validation

- [ ] **36.** End-to-end test: new user → login → select voice → chat 5+ turns → wrap up → generate takeaway → save → view in library.
- [ ] **37.** Confirm median response latency ≤ 4s.

---

## Phase 1 — Foundation Hardening (Week 2)

_Goal: make it secure, observable, production-safe._

### API robustness

- [ ] **38.** Add input validation on all API endpoints (zod or manual): validate UUIDs, string lengths, allowed enum values.
- [ ] **39.** Add typed error responses with consistent error shape (`{ error: string, code: string }`).
- [ ] **40.** Add retry logic for Anthropic API calls (exponential backoff, max 2 retries).
- [ ] **41.** Add timeout handling for DB writes and API calls.

### Deletion flow

- [ ] **42.** Create `DELETE /api/sessions/[id]` endpoint: hard delete session + cascade delete messages + takeaways.
- [ ] **43.** Add delete button in library/session detail with confirmation dialog.
- [ ] **44.** Test: verify cascade deletion leaves no orphaned records.

### Observability

- [ ] **45.** Add structured event logging: `session_started`, `session_completed`, `takeaway_saved`, `safety_triggered`, `session_deleted`.
- [ ] **46.** Log per-request metrics: latency, token count (prompt + completion), model used, prompt version.
- [ ] **47.** Build simple admin query/view for core metrics (can be a SQL dashboard or lightweight page).

### Security

- [ ] **48.** Add basic rate limiting on chat and takeaway endpoints (e.g. per-user, per-minute).
- [ ] **49.** Review: no API keys exposed client-side, no user content leaks in error messages, CORS configured.
- [ ] **50.** Run quick security checklist: RLS re-validation, auth edge cases (expired tokens, missing sessions).

---

## Phase 2 — Core Product MVP (Weeks 3–4)

_Goal: full v1 feature set._

### Voices

- [ ] **51.** Write system prompt overlays for all 3 voices: Gentle, Grounded, Coach. Ensure each prompt explicitly instructs the AI to respond in Swedish unless the user writes in another language.
- [ ] **52.** Update voice selection UI to show all 3 with brief descriptions.
- [ ] **53.** QA each voice: run 5+ test sessions per voice, verify distinct tone.

### Takeaway formats

- [ ] **54.** Write prompt templates for all 3 formats: Letter to Self, Key Realizations, Next Steps.
- [ ] **55.** Update takeaway selection UI to show all 3 formats.
- [ ] **56.** Test each format: verify output quality across different session types.

### Chat flow refinement

- [ ] **57.** Implement session stage tracking (Opening → Explore → Deepen → Synthesize → Close) — either in prompt logic or as a DB field.
- [ ] **58.** Refine wrap-up trigger UX: show as a gentle inline suggestion, not a modal. Allow user to continue or wrap up.
- [ ] **59.** Add auto-generated session titles (generate from first few messages or at completion).

### Library improvements

- [ ] **60.** Build proper session detail view: scrollable conversation, highlighted takeaway section.
- [ ] **61.** Add abandoned-session handling: if user returns to an active session, prompt to resume or archive.
- [ ] **62.** Add empty states and loading states for library and session views.

### Responsive design

- [ ] **63.** Mobile-responsive pass on all primary screens: login, voice select, chat, takeaway, library.
- [ ] **64.** Test on small screens (375px width): chat input stays fixed at bottom, messages scroll properly, buttons are tap-friendly.

### Polish

- [ ] **65.** Add subtle transitions: page transitions, message appear animations, button state changes.
- [ ] **66.** Refine typography and spacing across all views for visual consistency.

---

## Phase 3 — Quality, Safety & Launch Readiness (Week 5)

### Prompt testing

- [ ] **67.** Build prompt regression test set: minimum 25 scenarios covering normal reflection paths.
- [ ] **68.** Build safety test set: minimum 20 crisis/edge-case prompts — verify 100% correct routing.
- [ ] **69.** Run full test suite, document pass/fail, fix any regressions.

### Launch gates

- [ ] **70.** Define launch SLOs: max P95 latency, max error rate, min completion rate.
- [ ] **71.** Run 7-day prelaunch monitoring window against SLOs.
- [ ] **72.** Finalize all disclaimer copy: landing page, chat header, footer.
- [ ] **73.** Add crisis resources to all required surfaces (landing, chat, settings).

### Cost + guardrails

- [ ] **74.** Implement max turn limit per session (e.g. 20 turns) with graceful wrap-up prompt.
- [ ] **75.** Implement token budget cap per session.
- [ ] **76.** Add fallback UI when Anthropic API is down or errors out.

### Feedback

- [ ] **77.** Add simple feedback widget after takeaway generation (thumbs up/down + optional text).

### Landing page

- [ ] **78.** Build public landing page: what Sortify is, what it isn't, disclaimers, crisis resources, sign-in CTA.

---

## Phase 4 — Post-Launch (Week 6+)

- [ ] **79.** Monitor metrics weekly. Identify and fix biggest drop-off point in funnel.
- [ ] **80.** Add voices: Curious, Wise — after tone QA passes.
- [ ] **81.** Add takeaway formats: Reframe, Metaphor.
- [ ] **82.** Add export: download takeaway as plain text or PDF.
- [ ] **83.** Evaluate anonymous try-once mode (no auth required, single session, no save).
- [ ] **84.** Begin multilingual rollout: English + Swedish.

---

## Notes

- **Prompt versioning**: store `prompt_version` on every session from day one. When prompts change, bump the version string so you can compare quality across versions.
- **Session stages**: consider storing stage as a field on the session rather than inferring from message count each time — makes the prompt logic stateless per request.
- **Swedish as default language**: all system prompts must include an explicit instruction to respond in Swedish. UI strings should be hardcoded in Swedish for v1 (no i18n framework needed yet — that comes with the multilingual rollout in Phase 4). Crisis resources should reference Swedish services (e.g. Mind självmordslinjen, Jourhavande medmänniska) with international fallbacks.
- **CSS architecture**: one global variables file, one reset, then component-scoped styles using SvelteKit's built-in `<style>` blocks. Global utility classes only for layout and spacing.
- **Green accent reference**: start with something like `hsl(152, 56%, 40%)` — muted and calm. Hover: `hsl(152, 56%, 32%)`. Subtle background tint: `hsl(152, 40%, 95%)`. Adjust after seeing it in context.

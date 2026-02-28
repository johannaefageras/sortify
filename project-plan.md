# Sortify — Revised Project Plan

## 1. Product Summary

Sortify is a guided reflection web app that helps users process personal situations through a structured AI conversation, then generates a written takeaway they can save and revisit.

Sortify is not therapy and not crisis intervention.

## 2. Product Goals

- Help users move from mental clutter to clarity in one contained session.
- Produce useful takeaways users want to save and reread.
- Build trust through clear safety boundaries and strong privacy defaults.

## 3. Non-Goals (v1)

- Clinical diagnosis, treatment advice, or therapy replacement.
- Social feed, public profiles, or community sharing.
- Complex coaching plans, long-term programs, or mood analytics dashboards.

## 4. Success Metrics (MVP)

Track from day one:

- Activation rate: `% of new users who start first session within 24h`
- Session completion rate: `% of started sessions that reach takeaway generation`
- Takeaway save rate: `% of completed sessions where takeaway is saved`
- Return rate (D7): `% of users who start another session within 7 days`
- Safety intervention rate: `% of sessions where crisis flow is triggered`
- Cost per completed session: total model cost / completed sessions

Initial targets (adjust after first 100-200 users):

- Activation: >= 45%
- Completion: >= 55%
- Save rate: >= 60%
- D7 return: >= 20%

## 5. Core User Experience

1. User lands on Sortify and sees clear framing: reflection tool, not therapy.
2. User signs in (or uses planned anonymous mode in later phase).
3. User selects a voice.
4. User starts a guided chat (target 5-10 turns).
5. User wraps up and picks takeaway format.
6. AI generates takeaway.
7. User saves takeaway to library.

## 6. MVP Scope (v1)

In scope:

- Landing page with disclaimers and crisis resources.
- Voice selection (start with 3 voices: Gentle, Grounded, Coach).
- Streaming chat with structured reflection flow.
- Wrap-up trigger after minimum turn threshold.
- Takeaway generation in 3 formats:
  - Letter to Self
  - Key Realizations
  - Next Steps
- Save and view in personal library.
- Auth + per-user data isolation.
- Mobile-responsive UI.

Out of scope for v1:

- Reframe + Metaphor formats.
- Transcript export and public sharing.
- Mood tracking.
- Full multilingual support.
- Dark mode and PWA packaging.

## 7. Safety and Ethics Specification

### 7.1 Product Boundaries

- Always state: "Sortify is a reflection tool, not therapy or emergency support."
- Crisis resources must be available from every key screen.

### 7.2 Crisis Handling Rules

If user expresses potential self-harm, harm to others, or acute crisis indicators:

- Interrupt normal reflection flow.
- Respond with empathetic, direct support language.
- Recommend immediate professional/crisis resources.
- Ask if user can contact local emergency services or trusted person now.
- Do not continue normal prompt sequence until user indicates safety.

### 7.3 Safety Implementation

- Safety classifier/check runs on every user message before LLM response generation.
- Crisis flow uses a dedicated, locked response template and resource card.
- Store `safety_flag` and `safety_type` on session for monitoring.
- Review safety-trigger logs weekly in early launch.

## 8. Privacy and Security Requirements

- Supabase Auth for identity.
- Row Level Security enabled on all user content tables.
- Only authenticated user can create/read/update/delete their own sessions/messages/takeaways.
- Do not use user content for model training.
- Support hard delete for session and associated records.
- Retention policy documented before launch.

## 9. Technical Architecture

- Frontend: SvelteKit + Tailwind CSS
- Backend: SvelteKit API routes + Supabase
- AI: Anthropic API with streaming responses
- Hosting: Vercel or Cloudflare Pages
- Observability: basic event logging + error tracking + latency/token metrics

## 10. Data Model (Revised)

### users

Handled by Supabase Auth.

### sessions

- `id` uuid PK
- `user_id` uuid FK
- `voice` text
- `title` text nullable
- `status` text (`active`, `completed`, `abandoned`, `safety_interrupted`)
- `started_at` timestamptz
- `ended_at` timestamptz nullable
- `turn_count` int default 0
- `safety_flag` boolean default false
- `safety_type` text nullable
- `model` text
- `prompt_version` text
- `created_at` timestamptz default now()

### messages

- `id` uuid PK
- `session_id` uuid FK
- `role` text (`user`, `assistant`, `system`)
- `content` text
- `token_count` int nullable
- `latency_ms` int nullable
- `created_at` timestamptz default now()

### takeaways

- `id` uuid PK
- `session_id` uuid FK
- `format` text (`letter`, `realizations`, `steps`)
- `content` text
- `version` int default 1
- `regenerated_from_message_id` uuid nullable
- `created_at` timestamptz default now()

## 11. API Surface (v1)

- `POST /api/chat`
  - Input: `sessionId`, `message`
  - Behavior: safety check -> streamed assistant response -> persist message pair
- `POST /api/takeaway`
  - Input: `sessionId`, `format`
  - Behavior: generate from session transcript -> save takeaway
- `GET /api/sessions`
  - Returns user sessions for library
- `GET /api/sessions/[id]`
  - Returns session details + messages + takeaway
- `DELETE /api/sessions/[id]`
  - Hard delete session and related messages/takeaways

## 12. Prompting Strategy

- One base system prompt + voice-specific style overlays.
- Conversation rules:
  - Ask one question at a time.
  - Reflect user language before reframing.
  - Avoid prescriptive advice early.
- Track session stage internally:
  - Opening
  - Explore
  - Deepen
  - Synthesize
  - Close
- Separate prompt template for takeaway generation.
- Version prompts (`prompt_version`) for regression tracking.

## 13. Delivery Plan by Phase

Priority labels:

- `P0`: required for safe and usable launch
- `P1`: important improvements right after launch
- `P2`: nice-to-have / later optimization

---

### Phase 0 — Vertical Slice (Week 1)

Goal: prove one complete, reliable flow end-to-end.

Tasks:

- `P0` Initialize SvelteKit + Tailwind + Supabase + env setup.
- `P0` Implement auth (email magic link is enough for slice).
- `P0` Build minimal flow: voice select (1 voice), chat, 5-turn guidance, 1 takeaway format, save, library list.
- `P0` Implement safety check on each user message with crisis fallback response.
- `P0` Persist sessions/messages/takeaways with RLS enabled.
- `P1` Add lightweight metrics logging (activation/completion/save).
- `P2` Basic UI polish beyond functional defaults.

Acceptance criteria:

- Authenticated user can complete full session-to-library flow without manual DB edits.
- Safety trigger interrupts standard chat and shows crisis guidance.
- User cannot read another user's data (RLS validated with two accounts).
- Median end-to-end response latency <= 4s (excluding long network spikes).

---

### Phase 1 — Foundation Hardening (Week 2)

Goal: make the slice secure, observable, and production-safe.

Tasks:

- `P0` Add schema fields from revised model (`turn_count`, `safety_flag`, `model`, `prompt_version`, etc.).
- `P0` Add robust API validation and error handling.
- `P0` Add retry/timeout strategy for model and DB writes.
- `P0` Add deletion flow (session + cascade) from UI and API.
- `P1` Add structured event logging for latency, token usage, and safety events.
- `P1` Add admin-safe dashboards/queries for core metrics.
- `P2` Add basic rate limiting.

Acceptance criteria:

- All API endpoints validate payloads and return typed errors.
- Session deletion removes associated messages and takeaways consistently.
- Core events are queryable: started, completed, takeaway_saved, safety_triggered.
- No critical security findings from quick internal review checklist.

---

### Phase 2 — Core Product MVP (Week 3-4)

Goal: ship the full v1 feature set.

Tasks:

- `P0` Expand to 3 production voices (Gentle, Grounded, Coach).
- `P0` Implement wrap-up trigger UX after minimum turn threshold.
- `P0` Add 3 takeaway formats (Letter, Realizations, Next Steps).
- `P0` Implement library details view (open session + takeaway).
- `P0` Mobile-responsive pass for primary screens.
- `P1` Add abandoned-session recovery prompt (resume or archive).
- `P1` Improve title generation quality for saved sessions.
- `P2` Add small design refinements and micro-interactions.

Acceptance criteria:

- Users can run all 3 voices with distinct tone behavior.
- Wrap-up and takeaway generation works for >= 95% of completed sessions in QA runs.
- Library loads and renders session history on mobile and desktop.
- No blocker UX issues in top 3 user paths.

---

### Phase 3 — Quality, Safety, and Launch Readiness (Week 5)

Goal: reduce regressions and set launch gates.

Tasks:

- `P0` Build prompt regression test set (minimum 25 scenarios).
- `P0` Build safety test set (minimum 20 crisis/edge prompts).
- `P0` Define and apply launch SLOs (latency, error rate, completion).
- `P0` Finalize disclaimer copy and crisis resource localization.
- `P1` Add simple cost guardrails (max turns, token budget caps).
- `P1` Add fallback behavior when model/provider fails.
- `P2` Add in-app user feedback widget after takeaway.

Acceptance criteria:

- Regression suite passes agreed quality threshold before deploy.
- Safety suite passes 100% for required crisis-routing cases.
- P95 API error rate and latency are within launch targets for 7-day prelaunch window.
- Legal/safety copy reviewed and present on all required surfaces.

---

### Phase 4 — Post-Launch Improvements (Week 6+)

Goal: improve retention and usability after real usage data.

Tasks:

- `P0` Monitor metrics weekly and fix biggest drop-off step.
- `P1` Add remaining voices (Curious, Wise) after tone QA.
- `P1` Add additional takeaway formats (Reframe, Metaphor).
- `P1` Add export options (text/PDF).
- `P2` Evaluate anonymous try-once mode.
- `P2` Start multilingual rollout (English + Swedish).

Acceptance criteria:

- First post-launch iteration improves one primary funnel metric by >= 10% relative.
- New voice and format additions pass tone and safety checks.
- No increase in safety incident rate after expansion.

## 14. Launch Gates (Must Pass)

- Safety flow verified in staging and production.
- RLS validated with negative tests.
- Completion, save, and error metrics live.
- Cost/session within target budget.
- Incident response owner and triage process defined.

## 15. Key Open Decisions

- Pricing model (free tier limits vs paid unlimited).
- Anonymous mode timing (before or after first public launch).
- Regional crisis resource strategy for non-Swedish markets.
- Hosting choice based on latency + cost results from staging.

## 16. Immediate Start Plan (Next 5 Working Days)

1. Implement Phase 0 vertical slice with one voice and one takeaway format.
2. Add safety check + crisis fallback before refining tone/prompts.
3. Validate RLS and deletion behavior with two test users.
4. Add event tracking for activation/completion/save/safety.
5. Run internal QA on 20 sessions, then begin Phase 1 hardening.

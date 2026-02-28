# Sortify

Sortify is a guided reflection companion built with SvelteKit.

## Stack

- SvelteKit + TypeScript
- Tailwind CSS
- Supabase (auth + schema + RLS)
- Anthropic API (chat + takeaway generation)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and fill values:

```bash
cp .env.example .env
```

Required for full functionality:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

Optional (for admin/server operations later):

- `SUPABASE_SERVICE_ROLE_KEY`

The app still runs without API keys using fallback AI responses, but auth and protected routes require Supabase env vars.

3. Run dev server:

```bash
npm run dev
```

4. Apply database schema in Supabase SQL editor:

- Run `supabase/schema.sql`

## Implemented so far

- Landing page
- Magic-link auth (`/auth`, callback, signout)
- Protected routes: `/start`, `/chat`, `/library`
- Voice selection page (3 voices)
- Chat page with safety gate and wrap-up trigger
- API auth checks on `/api/chat`, `/api/takeaway`, `/api/sessions`
- Supabase schema + RLS policies (`supabase/schema.sql`)

## Next steps

- Stream responses from `/api/chat`
- Persist sessions/messages/takeaways in DB from API routes
- Render real saved sessions in library
- Add eval prompts/tests for safety and voice quality

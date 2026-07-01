# Deployment

QuizForge is a Vite + React SPA deployed to Vercel. Quiz generation runs through a serverless Edge Function at `/api/generate-quiz` so the Anthropic API key never ships to the browser in production.

## Quick start (local)

1. Copy the example env file and fill in values:

   ```bash
   cp .env.example .env
   ```

2. Set at minimum `ANTHROPIC_API_KEY` (server-side key used by the dev proxy and production Edge Function).

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Vite proxies `POST /api/generate-quiz` to the same handler used in production (`api/lib/handleGenerateQuiz`). With `VITE_USE_PROXY=true` (default), the client never calls Anthropic directly.

### Alternative: `vercel dev`

To run the app with Vercel’s local runtime (including the Edge Function):

```bash
npx vercel dev
```

Use the same `.env` values. Vercel loads server env vars for the API route; client vars must be prefixed with `VITE_`.

### Direct Anthropic calls (optional dev workflow)

Set `VITE_USE_PROXY=false` and provide `VITE_ANTHROPIC_API_KEY` to call Anthropic from the browser during development. Do **not** use this in production builds.

## Vercel project setup

1. Import the GitHub repository in the [Vercel dashboard](https://vercel.com).
2. Framework preset: **Vite** (build command `npm run build`, output directory `dist`).
3. `vercel.json` already rewrites non-API routes to `index.html` for client-side routing (`/history`, `/settings`, etc.).

### Required environment variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Server | Anthropic API key for `/api/generate-quiz` |

### Recommended environment variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `ALLOWED_ORIGINS` | Server | Comma-separated list of origins allowed for CORS on `/api/generate-quiz`. Include your production URL and `http://localhost:5173` for local dev. When unset, any request origin is allowed; when set, only listed origins receive CORS headers. |
| `VITE_USE_PROXY` | Client | Keep `true` in production so quiz generation uses the proxy. |

### Optional environment variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Client | Supabase project URL for cloud history sync |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon key (safe for client; protect with RLS) |

When Supabase vars are omitted, the app still works with local-only history.

## CORS (`ALLOWED_ORIGINS`)

The Edge Function validates the request `Origin` header against `ALLOWED_ORIGINS`. Example:

```env
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

Origins must match exactly (scheme, host, and port). Preflight `OPTIONS` requests are handled by the same route.

## API behavior notes

- **Rate limiting:** One quiz generation request per IP every 10 seconds (in-memory, per Edge instance). Bursts across instances are not globally coordinated.
- **Request body:** `{ content, settings, sourceType }`
- **Success response:** `{ quiz }`
- **Error response:** `{ error: { message, code? } }` with appropriate HTTP status (400, 429, 502, etc.)

## Supabase (optional)

History sync to Supabase is enabled when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. See the SQL schema comments in `src/api/supabase.ts` for table definitions.

**Row Level Security:** After creating tables, run [`supabase/migrations/001_rls_policies.sql`](../supabase/migrations/001_rls_policies.sql) in the Supabase SQL editor so users can only read and write their own `quizzes` and `attempts` rows (`auth.uid() = user_id`).

## CI/CD (GitHub Actions)

A workflow can run tests and deploy on push to `main`. Prerequisites:

**GitHub repository secrets**

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel personal or team token |
| `VERCEL_ORG_ID` | Vercel team/org ID |
| `VERCEL_PROJECT_ID` | Linked Vercel project ID |

**Typical CI steps:** `npm ci` → `npm run test:coverage` → Playwright E2E (mock `/api/generate-quiz`; no real API key needed in CI) → Vercel production deploy.

E2E tests stub the generate-quiz API, so `ANTHROPIC_API_KEY` is not required in the CI environment.

## Verification checklist

- [ ] `ANTHROPIC_API_KEY` set in Vercel (Production + Preview as needed)
- [ ] `ALLOWED_ORIGINS` includes production domain and localhost for dev
- [ ] `VITE_USE_PROXY=true` for production builds
- [ ] Deep links (`/history`, `/settings`) load after deploy
- [ ] Quiz generation succeeds from the deployed origin

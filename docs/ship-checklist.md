# Pre-launch ship checklist (v1.0.0)

Use this list before tagging a production release.

## Code quality

- [ ] `npm run check:i18n` — all 7 locale files have identical keys
- [ ] `npm run lint` — passes (includes `no-console`; only `console.warn` / `console.error` allowed)
- [ ] `npm run build` — production build succeeds
- [ ] `npm run test:coverage` — unit tests pass
- [ ] `npm run test:e2e` — Playwright E2E passes
- [ ] No unresolved `TODO` / `FIXME` in `src/` (or filed as GitHub issues)
- [ ] Fresh clone smoke test: `npm ci --legacy-peer-deps && cp .env.example .env && npm run dev`

## Environment and secrets

- [ ] [`.env.example`](../.env.example) is complete and matches [deployment.md](./deployment.md)
- [ ] `ANTHROPIC_API_KEY` set in **Vercel** (server-side only — never `VITE_ANTHROPIC_API_KEY` in production)
- [ ] `VITE_USE_PROXY=true` in production builds
- [ ] `ALLOWED_ORIGINS` includes production domain and `http://localhost:5173`
- [ ] Optional: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for cloud history sync

## Supabase security

- [ ] Run [`supabase/migrations/001_rls_policies.sql`](../supabase/migrations/001_rls_policies.sql) in the Supabase SQL editor
- [ ] RLS enabled on `quizzes` and `attempts`
- [ ] Policies restrict read/write to `auth.uid() = user_id`

## Deployment verification

- [ ] Vercel deployment is live
- [ ] Routes work: `/`, `/quiz`, `/history`, `/settings`, `/results/<valid-id>`
- [ ] Invalid attempt URL shows graceful error (e.g. `/results/nonexistent`)
- [ ] Deep links survive refresh (SPA rewrites in `vercel.json`)
- [ ] Quiz generation works from the deployed origin (CORS + Edge function)

## PWA, SEO, and analytics

- [ ] PWA install prompt works on Chrome mobile
- [ ] Open Graph image renders — test with [opengraph.xyz](https://www.opengraph.xyz/) (`/og-image.png`)
- [ ] Plausible loads only in production builds
- [ ] Lighthouse scores meet budget (see README Performance section)

## Security audit

- [ ] `npm audit` — no high or critical vulnerabilities (fix or document exceptions)

## Manual QA

- [ ] Complete [qa-checklist.md](./qa-checklist.md) journeys 1–3

## Release

- [ ] Update version / changelog if applicable
- [ ] `git tag v1.0.0 && git push origin v1.0.0` (only when ready to ship)

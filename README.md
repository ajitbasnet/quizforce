```
 ██████╗ ██╗   ██╗██╗███████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
██╔═══██╗██║   ██║██║╚══███╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
██║   ██║██║   ██║██║  ███╔╝ █████╗  ██║   ██║██████╔╝██║  ███╗█████╗
██║▄▄ ██║██║   ██║██║ ███╔╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝
╚██████╔╝╚██████╔╝██║███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝██║
 ╚══▀▀═╝  ╚═════╝ ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝
```

**Turn any content into an interactive quiz — with voice, history, and 7 languages.**

![QuizForge app screenshot](docs/images/app-screenshot.png)

> Screenshot placeholder — add `docs/images/app-screenshot.png` when a production capture is ready.

---

## Features

- 🤖 **AI quiz generation** — Paste text, upload a PDF, or describe a topic; Claude builds a structured quiz via a secure Edge proxy.
- 🔊 **Voice narration** — Web Speech API reads questions and feedback with per-language voice selection.
- 📚 **History & retakes** — Local (and optional Supabase) history with scores, filters, favorites, and attempt comparison.
- 🌍 **7-language UI + generation** — English, Spanish, French, Hindi, Nepali, German, and Chinese.
- 📱 **PWA install** — Installable app with offline-aware generation messaging.
- 🌙 **Dark mode** — Light, System, and Dark themes (see Phases 92–93 for theme implementation).
- ⌨️ **Keyboard shortcuts & a11y** — Shortcut help modal, focus management, reduced-motion support, and semantic UI primitives.

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Framework | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS 3, Framer Motion |
| State | Zustand (persisted settings + history) |
| Data | TanStack Query, Supabase (optional sync) |
| Forms | React Hook Form + Zod |
| i18n | i18next (7 locales) |
| AI | Claude via Vercel Edge proxy |
| Testing | Vitest, Playwright |
| Deploy | Vercel |

---

## Getting started

### Prerequisites

- **Node.js** 20+
- **npm** 9+

### Local development

```bash
git clone https://github.com/ajitbasnet/quizforce.git
cd quizforce
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Set at least `ANTHROPIC_API_KEY` in `.env` so the dev proxy can call Claude. See [`.env.example`](.env.example) for all variables.

For production deployment, CORS, Supabase, and CI details, see the full guide in [`docs/deployment.md`](docs/deployment.md).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run test` | Vitest (watch) |
| `npm run test:coverage` | Vitest with coverage |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run lint` | ESLint |

---

## Project structure

```
src/
├── api/              Claude client + Supabase integration
├── assets/           Static assets
├── components/       UI organized by domain (see below)
├── hooks/            React hooks (voice, theme, shortcuts, quiz flow, …)
├── i18n/             Translation JSON files + i18next initialization
├── pages/            Route-level page components
├── router/           React Router configuration
├── services/         Cross-cutting services (attempt persistence)
├── store/            Zustand stores (quiz, history, settings, voice)
├── types/            Shared TypeScript types
└── utils/            Pure helpers (prompt, schema, scoring, PDF, …)
```

### `components/` by domain

| Folder | Purpose |
|--------|---------|
| `auth/` | Sign-in modal and user menu |
| `dev/` | Development-only utilities (e.g. responsive layout tester) |
| `history/` | History list, cards, filters, attempt charts, detail panels |
| `illustrations/` | Empty-state SVG illustrations |
| `input/` | Text/PDF/prompt input, quiz settings, generate button |
| `layout/` | App shell, sidebar, top bar, offline banner, error boundaries |
| `onboarding/` | First-run welcome modal |
| `quiz/` | Quiz-taking UI — questions, answers, scoring, review |
| `results/` | Score breakdown, celebrations, export, and share |
| `seo/` | Document title and meta tags |
| `settings/` | Settings sections, quick drawer, data privacy |
| `shortcuts/` | Keyboard shortcut help modal |
| `ui/` | Shared primitives — Button, Modal, Badge, form controls |
| `voice/` | Voice toggle, player, and speech controls |

### Pages

| Page | Route |
|------|-------|
| `HomePage` | `/` — content input and quiz generation |
| `QuizPage` | `/quiz/:id` — take a quiz |
| `ResultsPage` | `/results/:id` — score and review |
| `HistoryPage` | `/history` — quiz library |
| `HistoryDetailPage` | `/history/:id` — single quiz detail and attempts |
| `SettingsPage` | `/settings` — preferences and defaults |

---

## Key architecture decisions

| Decision | Rationale |
|----------|-----------|
| **Zustand over Redux** | Three focused stores ([`quizStore`](src/store/quizStore.ts), [`historyStore`](src/store/historyStore.ts), [`settingsStore`](src/store/settingsStore.ts)) with minimal boilerplate; settings and history use Zustand `persist` middleware. |
| **No chart library** | [`AttemptScoreChart`](src/components/history/AttemptScoreChart.tsx) is a ~120-line inline SVG — one chart, zero extra dependency weight. |
| **Claude prompt structure** | [`buildQuizPrompt`](src/utils/promptBuilder.ts): system role enforces JSON-only output; the user message includes source context, generation parameters, required JSON shape, quality rules, and language instruction. |
| **Voice queue** | [`useVoice`](src/hooks/useVoice.ts): `splitIntoSentences` → `speechQueueRef` array; `speakNextInQueue` chains `SpeechSynthesisUtterance.onend`; `cancelSpeech` clears the queue on navigation or errors. |
| **Server-side AI key** | Quiz generation goes through `/api/generate-quiz` (Vercel Edge Function) so `ANTHROPIC_API_KEY` never ships to the browser in production. |
| **Optional Supabase** | When `VITE_SUPABASE_*` vars are set, history syncs to the cloud; otherwise everything stays in local storage. |

---

## Adding a new language

Follow this checklist when introducing an eighth locale (replace `xx` with the ISO code):

1. Add the code to the `SupportedLanguage` union in [`src/types/quiz.ts`](src/types/quiz.ts).
2. Add it to `SUPPORTED_LANGUAGE_CODES` in [`src/utils/validators.ts`](src/utils/validators.ts) and [`src/utils/languageLocale.ts`](src/utils/languageLocale.ts).
3. Add a `LANGUAGE_LABELS` entry in [`src/utils/promptBuilder.ts`](src/utils/promptBuilder.ts) (used in AI generation prompts).
4. Add a `LANG_MAP` BCP-47 entry in [`src/utils/voiceLang.ts`](src/utils/voiceLang.ts) (Web Speech API locale).
5. Create [`src/i18n/xx.json`](src/i18n/) — copy `en.json`, translate all keys, and verify key parity with the other locale files.
6. Register the locale in [`src/i18n/index.ts`](src/i18n/index.ts) (`resources` object and `LANGUAGE_OPTIONS` array).
7. The UI picks up the new language automatically via [`LanguageSelector`](src/components/ui/LanguageSelector.tsx).

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fajitbasnet%2Fquizforce)

After import, set environment variables in the Vercel dashboard:

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `ANTHROPIC_API_KEY` | Server | Yes | Anthropic API key for `/api/generate-quiz` |
| `ALLOWED_ORIGINS` | Server | Recommended | Comma-separated CORS allowlist (production URL + `http://localhost:5173`) |
| `VITE_USE_PROXY` | Client | Recommended | Keep `true` in production so the client uses the Edge proxy |
| `VITE_SUPABASE_URL` | Client | Optional | Supabase project URL for cloud history sync |
| `VITE_SUPABASE_ANON_KEY` | Client | Optional | Supabase anon key (protect with RLS) |

`vercel.json` rewrites non-API routes to `index.html` for client-side routing. CI runs tests on push and can deploy to Vercel when secrets are configured — see [`docs/deployment.md`](docs/deployment.md) for the full checklist, CORS notes, rate limiting, and Supabase schema.

---

## Privacy

QuizForge uses [Plausible Analytics](https://plausible.io/) in **production builds only** — a cookieless, GDPR-friendly analytics tool. No personal data, user IDs, or emails are collected.

**Events tracked (aggregate only):**

| Event | Properties |
|-------|------------|
| `quiz_generated` | `sourceType`, `questionCount`, `language` |
| `quiz_completed` | `score`, `percentage`, `timeTaken` |
| `voice_enabled` | — |
| `language_changed` | `to` (language code) |
| `pdf_uploaded` | — |

In development, the Plausible script is not loaded and `trackEvent()` is a no-op. You can read the implementation in [`src/utils/analytics.ts`](src/utils/analytics.ts).

---

## License

[MIT](LICENSE) — Copyright (c) 2026 QuizForge contributors

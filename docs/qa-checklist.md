# QA Checklist

Run automated checks first:

```bash
npm run build && npm run test:coverage && npm run test:e2e
```

## Journey 1 — Text → Results → History

- [ ] Paste text on home, customize settings, and generate a quiz
- [ ] Answer all questions and submit; results page shows score and explanations
- [ ] Voice auto-read works when voice is enabled (manual)
- [ ] Per-option explanations appear on the results review cards
- [ ] Navigate to History; completed quiz card is visible with score
- [ ] Switch locale (e.g. Spanish) and confirm translated UI strings

## Journey 2 — PDF → Export

- [ ] Upload a PDF on the home page; extracted text is shown
- [ ] Generate and complete the quiz
- [ ] Export results as CSV; file downloads with expected headers (`Question`, `Your Answer`, `Correct Answer`, `Points Earned`, `Is Correct`)
- [ ] Share score copy works from the results page (manual)

## Journey 3 — Language → Retake

- [ ] Open Settings and change language to Hindi (or another non-English locale)
- [ ] History page title and actions use the selected language
- [ ] Retake a quiz from history; quiz UI reflects the chosen language
- [ ] CSV export headers remain in English (data export convention)

## Mobile & accessibility (manual)

- [ ] Fixed submit bar on mobile quiz (last question) does not cover answers
- [ ] iOS voice gesture hint appears once after enabling voice on mobile
- [ ] History back-navigation restores scroll position
- [ ] Pull-to-refresh on History syncs when Supabase is configured
- [ ] Correct/wrong answer reveal triggers haptic feedback when supported
- [ ] PWA install prompt on Chrome mobile
- [ ] Test OG preview at [opengraph.xyz](https://www.opengraph.xyz/)

## Pre-ship

- [ ] `npm run check:i18n` passes (when script is available)
- [ ] `npm audit` — no unresolved high/critical issues
- [ ] Fresh clone: `npm ci --legacy-peer-deps && npm run dev`
- [ ] Lighthouse performance budget met on preview deploy

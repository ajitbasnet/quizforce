# i18n translation review (Phase 91)

Machine-translated strings added or updated in Phases 89–91. Each entry below should be proofread by a native speaker before release.

Locales: `es`, `fr`, `de`, `hi`, `ne`, `zh` (English `en.json` is the source of truth).

## Onboarding (`onboarding.*`)

| Key | Notes |
|-----|-------|
| `onboarding.welcomeTitle` | First-run welcome modal headline |
| `onboarding.tipVoice` | Settings / voice narration tip |
| `onboarding.tipLanguage` | Multi-language generation tip |
| `onboarding.tipHistory` | History persistence tip |
| `onboarding.gotIt` | Dismiss button — keep friendly and concise |

## Empty states (`history.*`)

| Key | Notes |
|-----|-------|
| `history.emptyTitle` | Direct address; first visit to History |
| `history.emptyDescription` | Encourages creating first quiz from home |
| `history.noSearchResults` | Interpolation: `{{query}}` |
| `history.clearSearch` | Link label to reset search filter |

## Confirmation dialogs (`history.*`)

| Key | Notes |
|-----|-------|
| `history.deleteDescription` | Interpolation: `{{title}}` — permanent delete warning |
| `history.clearAllDescription` | Interpolation: `{{count}}` — bulk delete warning |
| `history.deleteConfirm` | Sentence-case action verb |

## Loading copy (`quiz.*`, `results.*`)

| Key | Notes |
|-----|-------|
| `quiz.preparingQuestions` | Quiz page skeleton / screen reader |
| `quiz.stageCrafting` | Generation progress stage 2 |
| `results.tallyingScore` | Results page remote-load skeleton |

## Error messages (`errors.*`)

| Key | Notes |
|-----|-------|
| `errors.generic` | Actionable fallback — refresh or go home |
| `errors.generationFailed` | Quiz generation failure |
| `errors.loadFailed` | Data load failure |
| `errors.quizNotFound` | Missing quiz — redirect to home |
| `errors.tryAgain` | Sentence-case button label |
| `errors.retry` | Sentence-case retry action |

## Verification

```bash
node -e "
const fs=require('fs'),path=require('path');
function keys(o,p=''){return Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?keys(v,p+k+'.'):[p+k]);}
const base=keys(JSON.parse(fs.readFileSync('src/i18n/en.json'))).sort();
for(const f of fs.readdirSync('src/i18n').filter(x=>x.endsWith('.json'))){
  const k=keys(JSON.parse(fs.readFileSync(path.join('src/i18n',f)))).sort();
  const m=base.filter(x=>!k.includes(x)),e=k.filter(x=>!base.includes(x));
  if(m.length||e.length) console.log(f,'FAIL',m,e);
}
console.log('keys:', base.length);
"
```

Expected: **372 keys**, no missing or extra keys across all 7 locale files.

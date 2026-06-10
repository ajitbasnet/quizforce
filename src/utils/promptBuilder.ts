import type { Quiz, QuizSettings, SupportedLanguage } from '../types/quiz'

const SYSTEM_PROMPT =
  'You are QuizForge, an expert educator and quiz designer. You ALWAYS respond with valid JSON only — no markdown, no preamble, no explanation outside the JSON.'

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  hi: 'Hindi',
  ne: 'Nepali',
  de: 'German',
  zh: 'Chinese',
}

const SOURCE_TYPE_LABELS: Record<Quiz['sourceType'], string> = {
  text: 'Text content',
  pdf: 'PDF content',
  prompt: 'Topic or prompt',
  url: 'URL content',
}

const REQUIRED_JSON_SHAPE = `{
  "title": "...",
  "description": "...",
  "questions": [{
    "id": "...",
    "questionText": "...",
    "options": [{ "id": "...", "text": "..." }],
    "correctOptionId": "...",
    "explanation": "...",
    "wrongExplanations": { "optionId": "why wrong" },
    "points": 10,
    "difficulty": "easy|medium|hard",
    "topic": "optional"
  }]
}`

export function buildQuizPrompt(
  content: string,
  settings: QuizSettings,
  sourceType: Quiz['sourceType'],
): { system: string; user: string } {
  const sourceLabel = SOURCE_TYPE_LABELS[sourceType]
  const languageLabel = LANGUAGE_LABELS[settings.language]

  const user = [
    `## Source context (${sourceLabel})`,
    content,
    '',
    '## Generation parameters',
    `- Number of questions: ${settings.questionsCount}`,
    `- Difficulty: ${settings.difficulty}`,
    `- Language: ${settings.language}`,
    `- Points per question: ${settings.pointsPerQuestion}`,
    '',
    '## Required JSON shape',
    'Respond with a single JSON object matching this structure exactly:',
    REQUIRED_JSON_SHAPE,
    '',
    '## Quality rules',
    'Ensure wrongExplanations has an entry for every incorrect option. Explanation must be 1-2 sentences. Questions must test real understanding, not trivia.',
    '',
    '## Language instruction',
    `Write all questionText, options, explanation, and wrongExplanations in ${languageLabel}.`,
  ].join('\n')

  return { system: SYSTEM_PROMPT, user }
}

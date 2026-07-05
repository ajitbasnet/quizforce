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

export type QuizPromptParts = { system: string; user: string }

export function buildQuizPrompt(
  content: string,
  settings: QuizSettings,
  sourceType: Quiz['sourceType'],
): QuizPromptParts {
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

export function buildTranslateQuizPrompt(
  quiz: Quiz,
  targetLanguage: SupportedLanguage,
): QuizPromptParts {
  const languageLabel = LANGUAGE_LABELS[targetLanguage]

  const translatable = {
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      options: question.options,
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      wrongExplanations: question.wrongExplanations,
      points: question.points,
      difficulty: question.difficulty,
      topic: question.topic,
    })),
  }

  const user = [
    '## Task',
    'Translate this quiz to the target language.',
    '',
    '## Quiz JSON',
    JSON.stringify(translatable, null, 2),
    '',
    '## Target language',
    targetLanguage,
    '',
    '## Required JSON shape',
    'Respond with a single JSON object matching this structure exactly:',
    REQUIRED_JSON_SHAPE,
    '',
    '## Translation rules',
    `- Translate all human-readable strings (title, description, questionText, option text, explanation, wrongExplanations values, topic) to ${languageLabel}.`,
    '- Do NOT change any id, correctOptionId, points, difficulty, or option count.',
    '- Preserve every id and correctOptionId exactly as in the input.',
    '- Return valid JSON only — no markdown fences or preamble.',
  ].join('\n')

  return { system: SYSTEM_PROMPT, user }
}

export function buildGeminiRequestBody(
  parts: QuizPromptParts,
  temperature: number,
) {
  return {
    systemInstruction: { parts: [{ text: parts.system }] },
    contents: [{ role: 'user', parts: [{ text: parts.user }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature,
    },
  }
}

export function buildGroqRequestBody(
  parts: QuizPromptParts,
  temperature: number,
) {
  return {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: parts.system },
      { role: 'user', content: parts.user },
    ],
    response_format: { type: 'json_object' },
    temperature,
  }
}

export type TargetAudience =
  | 'elementary'
  | 'high_school'
  | 'college'
  | 'professional'
  | 'custom'

export interface PromptBuilderFields {
  topic: string
  subtopics: string
  audience: TargetAudience
  customAudience: string
  specialInstructions: string
}

export interface PromptBuilderLabels {
  audience: string
}

export function assemblePrompt(
  fields: PromptBuilderFields,
  labels: PromptBuilderLabels,
): string {
  const lines: string[] = [`Create a quiz on the topic: ${fields.topic.trim()}`]

  const subtopics = fields.subtopics.trim()
  if (subtopics) {
    lines.push('', `Subtopics to cover: ${subtopics}`)
  }

  lines.push('', `Target audience: ${labels.audience}`)

  const instructions = fields.specialInstructions.trim()
  if (instructions) {
    lines.push('', `Special instructions: ${instructions}`)
  }

  return lines.join('\n')
}

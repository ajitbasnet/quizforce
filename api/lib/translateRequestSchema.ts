import { z } from 'zod'

const supportedLanguageSchema = z.enum([
  'en',
  'es',
  'fr',
  'hi',
  'ne',
  'de',
  'zh',
])

const sourceTypeSchema = z.enum(['text', 'pdf', 'prompt', 'url'])

const quizSettingsSchema = z.object({
  pointsPerQuestion: z.number(),
  customPointsMap: z.record(z.string(), z.number()),
  questionsCount: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  voiceEnabled: z.boolean(),
  voiceRate: z.number(),
  voicePitch: z.number(),
  voiceURI: z.string().nullable(),
  timerEnabled: z.boolean(),
  language: supportedLanguageSchema,
})

const quizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
})

const quizQuestionSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  options: z.array(quizOptionSchema).min(2),
  correctOptionId: z.string(),
  explanation: z.string(),
  wrongExplanations: z.record(z.string(), z.string()),
  points: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().optional(),
})

const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(quizQuestionSchema).min(1),
  totalPoints: z.number(),
  language: supportedLanguageSchema,
  createdAt: z.string(),
  sourceType: sourceTypeSchema,
  sourceContent: z.string(),
  settings: quizSettingsSchema,
  isFavorited: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

export const translateQuizRequestSchema = z.object({
  quiz: quizSchema,
  targetLanguage: supportedLanguageSchema,
})

export type TranslateQuizRequest = z.infer<typeof translateQuizRequestSchema>

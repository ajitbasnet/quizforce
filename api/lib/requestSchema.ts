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
  customPointsMap: z.record(z.string(), z.number()).default({}),
  questionsCount: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  voiceEnabled: z.boolean(),
  voiceRate: z.number(),
  voicePitch: z.number(),
  voiceURI: z.string().nullable().default(null),
  timerEnabled: z.boolean().default(false),
  language: supportedLanguageSchema,
})

export const generateQuizRequestSchema = z.object({
  content: z.string().min(1),
  settings: quizSettingsSchema,
  sourceType: sourceTypeSchema,
})

export type GenerateQuizRequest = z.infer<typeof generateQuizRequestSchema>

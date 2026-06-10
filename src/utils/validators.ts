import { z } from 'zod'
import type { SupportedLanguage } from '../types/quiz'
import type { TargetAudience } from './promptBuilder'

export const TEXT_INPUT_MAX_CHARS = 20_000
export const TEXT_INPUT_WARN_CHARS = 15_000
export const PDF_MIN_CHARS = 100

const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'fr',
  'hi',
  'ne',
  'de',
  'zh',
] as const satisfies readonly SupportedLanguage[]

const TARGET_AUDIENCES = [
  'elementary',
  'high_school',
  'college',
  'professional',
  'custom',
] as const satisfies readonly TargetAudience[]

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'mixed'] as const

const I18N_KEY_PATTERN = /^(input|errors|settings|quiz)\.[a-zA-Z]+/

export const textInputSchema = z
  .string()
  .trim()
  .min(50, 'input.textMinLengthError')
  .max(TEXT_INPUT_MAX_CHARS, 'input.textMaxLengthError')

export const pdfSchema = z
  .string()
  .trim()
  .min(PDF_MIN_CHARS, 'input.pdfTooShort')

export const promptSchema = z
  .object({
    topic: z
      .string()
      .trim()
      .min(3, 'input.topicMinLengthError')
      .max(200, 'input.topicMaxLengthError'),
    subtopics: z.string().max(500, 'input.subtopicsMaxLengthError'),
    audience: z.enum(TARGET_AUDIENCES),
    customAudience: z.string().max(100, 'input.customAudienceMaxLengthError'),
    specialInstructions: z
      .string()
      .max(1000, 'input.specialInstructionsMaxLengthError'),
  })
  .superRefine((data, ctx) => {
    if (data.audience === 'custom' && !data.customAudience.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'input.customAudienceRequiredError',
        path: ['customAudience'],
      })
    }
  })

export const promptTopicSchema = promptSchema.shape.topic

export const settingsSchema = z.object({
  questionsCount: z
    .number()
    .int()
    .min(5, 'input.questionsCountRangeError')
    .max(50, 'input.questionsCountRangeError'),
  pointsPerQuestion: z
    .number()
    .int()
    .min(1, 'input.pointsPerQuestionRangeError')
    .max(100, 'input.pointsPerQuestionRangeError'),
  difficulty: z.enum(DIFFICULTY_LEVELS),
  language: z.enum(SUPPORTED_LANGUAGES),
  voiceEnabled: z.boolean(),
  timerEnabled: z.boolean(),
  voiceRate: z
    .number()
    .min(0.5, 'input.voiceRateRangeError')
    .max(2, 'input.voiceRateRangeError'),
  voicePitch: z
    .number()
    .min(0.5, 'input.voicePitchRangeError')
    .max(2, 'input.voicePitchRangeError'),
  customPointsMap: z.record(z.string(), z.number().int().positive()),
})

export type PromptFormValues = z.infer<typeof promptSchema>

export function translateValidationMessage(
  message: string | undefined,
  t: (key: string) => string,
): string | undefined {
  if (!message) return undefined
  if (I18N_KEY_PATTERN.test(message)) {
    return t(message)
  }
  return message
}

export function validateQuizInput(_input: unknown): boolean {
  return true
}

import { z } from 'zod'
import type { GenerateQuizParams } from '../types/api'
import type { Quiz, QuizQuestion } from '../types/quiz'

const claudeQuizOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
})

const claudeQuizQuestionSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  options: z.array(claudeQuizOptionSchema).min(2),
  correctOptionId: z.string(),
  explanation: z.string(),
  wrongExplanations: z.record(z.string(), z.string()),
  points: z.number(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  topic: z.string().optional(),
})

export const claudeQuizResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(claudeQuizQuestionSchema),
})

export type ClaudeQuizResponse = z.infer<typeof claudeQuizResponseSchema>

function truncateSourceContent(content: string, maxLength = 500): string {
  if (content.length <= maxLength) return content
  return `${content.slice(0, maxLength)}...`
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenceMatch ? fenceMatch[1].trim() : trimmed
}

export function mapClaudeResponseToQuiz(
  response: ClaudeQuizResponse,
  params: Pick<GenerateQuizParams, 'content' | 'settings' | 'sourceType'>,
): Quiz {
  const { settings, sourceType, content } = params

  const questions: QuizQuestion[] = response.questions.map((question) => ({
    ...question,
    points:
      settings.customPointsMap[question.id] ??
      question.points ??
      settings.pointsPerQuestion,
  }))

  const totalPoints = questions.reduce(
    (sum, question) =>
      sum + (question.points ?? settings.pointsPerQuestion),
    0,
  )

  return {
    id: crypto.randomUUID(),
    title: response.title,
    description: response.description,
    questions,
    totalPoints,
    language: settings.language,
    createdAt: new Date().toISOString(),
    sourceType,
    sourceContent: truncateSourceContent(content),
    settings,
  }
}

export function parseAndValidateClaudeQuiz(
  text: string,
  params: Pick<GenerateQuizParams, 'content' | 'settings' | 'sourceType'>,
): Quiz {
  const jsonText = stripMarkdownFences(text)
  const parsed: unknown = JSON.parse(jsonText)
  const validated = claudeQuizResponseSchema.parse(parsed)
  return mapClaudeResponseToQuiz(validated, params)
}

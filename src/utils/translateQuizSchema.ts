import type { Quiz, SupportedLanguage } from '../types/quiz'
import {
  claudeQuizResponseSchema,
  type ClaudeQuizResponse,
} from './quizSchema'

export class TranslateQuizValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TranslateQuizValidationError'
  }
}

function stripMarkdownFences(text: string): string {
  const trimmed = text.trim()
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  return fenceMatch ? fenceMatch[1].trim() : trimmed
}

function assertStructuralMatch(
  translated: ClaudeQuizResponse,
  original: Quiz,
): void {
  if (translated.questions.length !== original.questions.length) {
    throw new TranslateQuizValidationError(
      'Translated quiz question count does not match original',
    )
  }

  for (let i = 0; i < original.questions.length; i++) {
    const origQ = original.questions[i]
    const transQ = translated.questions[i]

    if (transQ.id !== origQ.id) {
      throw new TranslateQuizValidationError(
        `Question id mismatch at index ${i}: expected ${origQ.id}, got ${transQ.id}`,
      )
    }

    if (transQ.correctOptionId !== origQ.correctOptionId) {
      throw new TranslateQuizValidationError(
        `correctOptionId changed for question ${origQ.id}`,
      )
    }

    if (transQ.options.length !== origQ.options.length) {
      throw new TranslateQuizValidationError(
        `Option count changed for question ${origQ.id}`,
      )
    }

    for (let j = 0; j < origQ.options.length; j++) {
      if (transQ.options[j].id !== origQ.options[j].id) {
        throw new TranslateQuizValidationError(
          `Option id mismatch for question ${origQ.id} at index ${j}`,
        )
      }
    }
  }
}

export function mergeTranslatedQuiz(
  translated: ClaudeQuizResponse,
  original: Quiz,
  targetLanguage: SupportedLanguage,
): Quiz {
  assertStructuralMatch(translated, original)

  const questions = original.questions.map((origQ, i) => {
    const transQ = translated.questions[i]
    return {
      ...origQ,
      questionText: transQ.questionText,
      options: origQ.options.map((opt, j) => ({
        id: opt.id,
        text: transQ.options[j].text,
      })),
      explanation: transQ.explanation,
      wrongExplanations: transQ.wrongExplanations,
      topic: transQ.topic ?? origQ.topic,
    }
  })

  return {
    ...original,
    title: translated.title,
    description: translated.description,
    questions,
    language: targetLanguage,
    settings: { ...original.settings, language: targetLanguage },
  }
}

export function parseAndMergeTranslatedQuiz(
  text: string,
  originalQuiz: Quiz,
  targetLanguage: SupportedLanguage,
): Quiz {
  const jsonText = stripMarkdownFences(text)
  const raw = JSON.parse(jsonText) as unknown
  const validated = claudeQuizResponseSchema.parse(raw)
  return mergeTranslatedQuiz(validated, originalQuiz, targetLanguage)
}

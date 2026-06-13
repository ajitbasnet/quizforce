import type { Quiz, QuizAttempt } from '../types/quiz'

export function sanitizeExportSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'quiz'
}

export function getResultsExportFilename(
  quiz: Quiz,
  ext: 'json' | 'csv',
): string {
  return `quizforge-${sanitizeExportSlug(quiz.title)}-results.${ext}`
}

export function buildResultsJson(quiz: Quiz, attempt: QuizAttempt): string {
  return JSON.stringify({ quiz, attempt }, null, 2)
}

function getOptionText(
  options: Quiz['questions'][number]['options'],
  optionId: string | undefined,
): string {
  if (!optionId) return ''
  return options.find((option) => option.id === optionId)?.text ?? ''
}

export function buildResultsCsvData(quiz: Quiz, attempt: QuizAttempt) {
  const headers = [
    'Question',
    'Your Answer',
    'Correct Answer',
    'Points Earned',
    'Is Correct',
  ]

  const rows = quiz.questions.map((question) => {
    const feedback = attempt.feedback.find(
      (entry) => entry.questionId === question.id,
    )
    const selectedOptionId = attempt.answers[question.id]

    return [
      question.questionText,
      getOptionText(question.options, selectedOptionId),
      getOptionText(question.options, question.correctOptionId),
      feedback?.pointsAwarded ?? 0,
      feedback?.isCorrect ?? false,
    ]
  })

  return { headers, rows }
}

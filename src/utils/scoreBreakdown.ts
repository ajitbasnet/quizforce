import type { Quiz, QuizAttempt } from '../types/quiz'

export interface ScoreBreakdownData {
  correctCount: number
  incorrectCount: number
  correctPoints: number
  showDifficultyTable: boolean
  difficultyRows: Array<{
    difficulty: 'easy' | 'medium' | 'hard'
    total: number
    correct: number
    accuracy: number
  }>
}

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'] as const

export function getScoreBreakdown(
  quiz: Quiz,
  attempt: QuizAttempt,
): ScoreBreakdownData {
  const feedbackByQuestionId = new Map(
    attempt.feedback.map((f) => [f.questionId, f]),
  )

  const correctCount = attempt.feedback.filter((f) => f.isCorrect).length
  const incorrectCount = attempt.feedback.length - correctCount
  const correctPoints = attempt.feedback.reduce(
    (sum, f) => sum + f.pointsAwarded,
    0,
  )

  const distinctDifficulties = new Set(quiz.questions.map((q) => q.difficulty))
  const showDifficultyTable =
    quiz.settings.difficulty === 'mixed' || distinctDifficulties.size >= 2

  const difficultyRows = DIFFICULTY_ORDER.flatMap((difficulty) => {
    const questions = quiz.questions.filter((q) => q.difficulty === difficulty)
    const total = questions.length
    if (total === 0) return []

    const correct = questions.filter((q) => {
      const feedback = feedbackByQuestionId.get(q.id)
      return feedback?.isCorrect ?? false
    }).length

    const accuracy =
      total > 0 ? Math.round((correct / total) * 1000) / 10 : 0

    return [{ difficulty, total, correct, accuracy }]
  })

  return {
    correctCount,
    incorrectCount,
    correctPoints,
    showDifficultyTable,
    difficultyRows,
  }
}

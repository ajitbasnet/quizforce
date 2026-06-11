import type { AnswerFeedback, Quiz, QuizAttempt } from '../types/quiz'

export function buildQuizAttempt(
  quiz: Quiz,
  answers: Record<string, string>,
  timeTaken: number,
): QuizAttempt {
  const feedback: AnswerFeedback[] = quiz.questions.map((question) => {
    const selectedOptionId = answers[question.id] ?? ''
    const isCorrect = selectedOptionId === question.correctOptionId
    const pointsAwarded = isCorrect ? question.points : 0
    const explanation = isCorrect
      ? question.explanation
      : (question.wrongExplanations[selectedOptionId] ?? '')

    return {
      questionId: question.id,
      selectedOptionId,
      isCorrect,
      explanation,
      pointsAwarded,
    }
  })

  const score = calculateScore(feedback)
  const totalPoints = quiz.totalPoints
  const percentage =
    totalPoints > 0
      ? Math.round((score / totalPoints) * 1000) / 10
      : 0

  return {
    id: crypto.randomUUID(),
    quizId: quiz.id,
    answers,
    score,
    totalPoints,
    percentage,
    completedAt: new Date().toISOString(),
    timeTaken,
    feedback,
  }
}

export function calculateScore(feedback: AnswerFeedback[]): number {
  return feedback.reduce((sum, f) => sum + f.pointsAwarded, 0)
}

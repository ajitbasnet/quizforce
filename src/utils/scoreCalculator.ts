import { nanoid } from 'nanoid'
import type { AnswerFeedback, Quiz, QuizAttempt } from '../types/quiz'

export function calculateScore(
  quiz: Quiz,
  userAnswers: Record<string, string>,
  customPointsMap: Record<string, number>,
  timeTaken: number,
): QuizAttempt {
  const feedback: AnswerFeedback[] = quiz.questions.map((question) => {
    const questionPoints = customPointsMap[question.id] ?? question.points
    const selectedOptionId = userAnswers[question.id] ?? ''
    const isCorrect = selectedOptionId === question.correctOptionId
    const pointsAwarded = isCorrect ? questionPoints : 0
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

  const score = feedback.reduce((sum, f) => sum + f.pointsAwarded, 0)
  const totalPoints = quiz.questions.reduce(
    (sum, q) => sum + (customPointsMap[q.id] ?? q.points),
    0,
  )
  const percentage =
    totalPoints > 0
      ? Math.round((score / totalPoints) * 1000) / 10
      : 0

  return {
    id: nanoid(),
    quizId: quiz.id,
    answers: userAnswers,
    score,
    totalPoints,
    percentage,
    timeTaken,
    completedAt: new Date().toISOString(),
    feedback,
  }
}

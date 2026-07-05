import type { Quiz, QuizAttempt } from '../types/quiz'

export function rebuildAttemptFeedback(
  quiz: Quiz,
  attempt: QuizAttempt,
): QuizAttempt {
  const questionById = new Map(quiz.questions.map((q) => [q.id, q]))

  const feedback = attempt.feedback.map((entry) => {
    const question = questionById.get(entry.questionId)
    if (!question) return entry

    const explanation = entry.isCorrect
      ? question.explanation
      : (question.wrongExplanations[entry.selectedOptionId] ?? '')

    return { ...entry, explanation }
  })

  return { ...attempt, feedback }
}

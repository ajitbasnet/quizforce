import { QuestionReviewCard } from '../quiz/QuestionReviewCard'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsStore } from '../../store/settingsStore'
import type { Quiz, QuizAttempt } from '../../types/quiz'

interface HistoryDetailProps {
  quiz: Quiz
  attempt: QuizAttempt
}

export function HistoryDetail({ quiz, attempt }: HistoryDetailProps) {
  const { t } = useLanguage()
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-text-primary dark:text-gray-100">
        {t('results.answerReview')}
      </h2>
      <div className="flex flex-col gap-3">
        {quiz.questions.map((question, index) => {
          const feedback = attempt.feedback.find(
            (entry) => entry.questionId === question.id,
          )
          const selectedOptionId = attempt.answers[question.id]

          return (
            <QuestionReviewCard
              key={question.id}
              question={question}
              feedback={
                feedback ?? {
                  questionId: question.id,
                  selectedOptionId: selectedOptionId ?? '',
                  isCorrect: false,
                  explanation: '',
                  pointsAwarded: 0,
                }
              }
              questionNumber={index + 1}
              maxPoints={
                quiz.settings.customPointsMap[question.id] ?? question.points
              }
              voiceEnabled={voiceEnabled}
              language={quiz.language}
            />
          )
        })}
      </div>
    </section>
  )
}

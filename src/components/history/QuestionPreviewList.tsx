import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz } from '../../types/quiz'
import { QuestionReviewCard } from '../quiz/QuestionReviewCard'

interface QuestionPreviewListProps {
  quiz: Quiz
}

export function QuestionPreviewList({ quiz }: QuestionPreviewListProps) {
  const { t } = useLanguage()

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-text-primary dark:text-gray-100">
        {t('history.questionPreview')}
      </h2>
      <div className="flex flex-col gap-3">
        {quiz.questions.map((question, index) => (
          <QuestionReviewCard
            key={question.id}
            question={question}
            feedback={{
              questionId: question.id,
              selectedOptionId: question.correctOptionId,
              isCorrect: true,
              explanation: question.explanation,
              pointsAwarded:
                quiz.settings.customPointsMap[question.id] ?? question.points,
            }}
            questionNumber={index + 1}
            maxPoints={
              quiz.settings.customPointsMap[question.id] ?? question.points
            }
            language={quiz.language}
            previewMode
            animateReveal={false}
          />
        ))}
      </div>
    </section>
  )
}

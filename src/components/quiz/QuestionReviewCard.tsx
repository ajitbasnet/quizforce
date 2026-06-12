import type { AnswerFeedback, QuizQuestion } from '../../types/quiz'
import { Card } from '../ui/Card'

interface QuestionReviewCardProps {
  question: QuizQuestion
  feedback?: AnswerFeedback
  selectedOptionId?: string
  index: number
}

export function QuestionReviewCard({
  question,
  index,
}: QuestionReviewCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-text-muted">
        Q{index + 1}
      </p>
      <p className="mt-1 truncate text-text-primary">{question.questionText}</p>
    </Card>
  )
}

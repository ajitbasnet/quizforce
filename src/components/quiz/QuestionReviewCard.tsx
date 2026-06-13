import type { AnswerFeedback, QuizQuestion } from '../../types/quiz'
import { getOptionFeedback } from '../../utils/quizFeedback'
import { Card } from '../ui/Card'
import { AnswerReviewOption } from './AnswerReviewOption'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

interface QuestionReviewCardProps {
  question: QuizQuestion
  feedback?: AnswerFeedback
  selectedOptionId?: string
  index: number
}

export function QuestionReviewCard({
  question,
  selectedOptionId,
  index,
}: QuestionReviewCardProps) {
  return (
    <Card>
      <p className="text-sm font-medium text-text-muted">Q{index + 1}</p>
      <p className="mt-1 text-lg font-semibold leading-relaxed text-text-primary">
        {question.questionText}
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {question.options.map((option, optionIndex) => (
          <AnswerReviewOption
            key={option.id}
            letter={OPTION_LETTERS[optionIndex] ?? String(optionIndex + 1)}
            text={option.text}
            isCorrect={option.id === question.correctOptionId}
            isSelected={option.id === selectedOptionId}
            explanation={getOptionFeedback(question, option.id, true)}
            showLabel
          />
        ))}
      </div>
    </Card>
  )
}

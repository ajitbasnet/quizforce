import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { LG_MEDIA_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { useVoice } from '../../hooks/useVoice'
import type { AnswerFeedback, QuizQuestion, SupportedLanguage } from '../../types/quiz'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { AnswerReviewOption } from './AnswerReviewOption'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

interface QuestionReviewCardProps {
  question: QuizQuestion
  feedback: AnswerFeedback
  questionNumber: number
  maxPoints?: number
  voiceEnabled?: boolean
  language?: SupportedLanguage
}

export function QuestionReviewCard({
  question,
  feedback,
  questionNumber,
  maxPoints = question.points,
  voiceEnabled = false,
  language,
}: QuestionReviewCardProps) {
  const { t } = useLanguage()
  const { speakSequence, isSupported } = useVoice()
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY)
  const [expanded, setExpanded] = useState(isDesktop)

  const correctOptionIndex = question.options.findIndex(
    (option) => option.id === question.correctOptionId,
  )
  const correctOption = question.options[correctOptionIndex]
  const correctLetter =
    OPTION_LETTERS[correctOptionIndex] ?? String(correctOptionIndex + 1)

  const wrongExplanation =
    question.wrongExplanations[feedback.selectedOptionId] ??
    feedback.explanation

  const handleReadAloud = () => {
    const optionLines = question.options.map(
      (option, index) =>
        `Option ${OPTION_LETTERS[index] ?? String(index + 1)}: ${option.text}`,
    )

    const explanationLine = feedback.isCorrect
      ? question.explanation
      : [
          wrongExplanation,
          t('results.correctAnswerIs', {
            letter: correctLetter,
            text: correctOption?.text ?? '',
          }),
          question.explanation,
        ]
          .filter(Boolean)
          .join(' ')

    speakSequence(
      [question.questionText, ...optionLines, explanationLine],
      language,
    )
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default" size="sm">
          {t('quiz.questionChip', { number: questionNumber })}
        </Badge>
        {question.topic && (
          <Badge variant="default" size="sm">
            {question.topic}
          </Badge>
        )}
        <Badge
          variant={feedback.isCorrect ? 'success' : 'danger'}
          size="sm"
        >
          {t('results.pointsScore', {
            awarded: feedback.pointsAwarded,
            total: maxPoints,
          })}
        </Badge>
      </div>

      <p className="mt-2 text-lg font-semibold leading-relaxed text-text-primary">
        {question.questionText}
      </p>

      {voiceEnabled && isSupported && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          leftIcon={<Volume2 className="h-4 w-4" aria-hidden />}
          onClick={handleReadAloud}
        >
          {t('voice.readQuestion')}
        </Button>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {question.options.map((option, optionIndex) => (
          <AnswerReviewOption
            key={option.id}
            letter={OPTION_LETTERS[optionIndex] ?? String(optionIndex + 1)}
            text={option.text}
            isCorrect={option.id === question.correctOptionId}
            isSelected={option.id === feedback.selectedOptionId}
            showLabel
          />
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-4"
        rightIcon={
          expanded ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )
        }
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {expanded
          ? t('results.hideExplanation')
          : t('results.showExplanation')}
      </Button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3">
              {feedback.isCorrect ? (
                <div className="border-l-4 border-green-500 bg-green-50 py-3 pl-4">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">
                      ✓ {t('results.whyCorrect')}
                    </span>{' '}
                    {question.explanation}
                  </p>
                </div>
              ) : (
                <>
                  <div className="border-l-4 border-red-500 bg-red-50 py-3 pl-4">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">
                        ✗ {t('results.whyWrong')}
                      </span>{' '}
                      {wrongExplanation}
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 bg-green-50 py-3 pl-4">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">✓ </span>
                      {t('results.correctAnswerIs', {
                        letter: correctLetter,
                        text: correctOption?.text ?? '',
                      })}
                      {question.explanation}
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

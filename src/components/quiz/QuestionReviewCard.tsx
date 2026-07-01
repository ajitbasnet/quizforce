import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import {
  LG_MEDIA_QUERY,
  PREFERS_REDUCED_MOTION_QUERY,
  useMediaQuery,
} from '../../hooks/useMediaQuery'
import { useVoice } from '../../hooks/useVoice'
import type { AnswerFeedback, QuizQuestion, SupportedLanguage } from '../../types/quiz'
import type { AnswerFeedbackVariant } from '../../utils/answerFeedbackStyles'
import { vibrateCorrect, vibrateWrong } from '../../utils/haptics'
import { FormattedText } from '../../utils/markdownLite'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AnswerReviewOption } from './AnswerReviewOption'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

type RevealPhase = 'initial' | 'correct' | 'wrong' | 'explanation' | 'done'

const explanationVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

function getDisplayVariant(
  phase: RevealPhase,
  isCorrect: boolean,
  isSelected: boolean,
): AnswerFeedbackVariant {
  if (phase === 'initial') return 'dimmed'
  if (isCorrect) return 'correct'
  if (
    isSelected &&
    !isCorrect &&
    (phase === 'wrong' || phase === 'explanation' || phase === 'done')
  ) {
    return 'wrongSelected'
  }
  return 'dimmed'
}

interface QuestionReviewCardProps {
  question: QuizQuestion
  feedback: AnswerFeedback
  questionNumber: number
  maxPoints?: number
  voiceEnabled?: boolean
  language?: SupportedLanguage
  animateReveal?: boolean
  attemptId?: string
  previewMode?: boolean
}

export function QuestionReviewCard({
  question,
  feedback,
  questionNumber,
  maxPoints = question.points,
  voiceEnabled = false,
  language,
  animateReveal = false,
  attemptId,
  previewMode = false,
}: QuestionReviewCardProps) {
  const { t } = useLanguage()
  const { speakSequence, isSupported } = useVoice()
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY)
  const prefersReducedMotion = useMediaQuery(PREFERS_REDUCED_MOTION_QUERY)
  const skipAnimation = previewMode || !animateReveal || prefersReducedMotion
  const [expanded, setExpanded] = useState(previewMode || isDesktop)
  const [phase, setPhase] = useState<RevealPhase>(() =>
    skipAnimation ? 'done' : 'initial',
  )
  const hasStartedReveal = useRef(false)

  useEffect(() => {
    hasStartedReveal.current = false
  }, [attemptId])

  useEffect(() => {
    if (skipAnimation) {
      setPhase('done')
      return
    }

    if (hasStartedReveal.current) return

    hasStartedReveal.current = true
    setPhase('initial')

    const timers = [
      setTimeout(() => setPhase('correct'), 200),
      setTimeout(() => setPhase('wrong'), 400),
      setTimeout(() => setPhase('explanation'), 600),
      setTimeout(() => setPhase('done'), 900),
    ]

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [attemptId, animateReveal, skipAnimation])

  useEffect(() => {
    if (skipAnimation || previewMode) return
    if (phase === 'correct') vibrateCorrect()
    if (phase === 'wrong') vibrateWrong()
  }, [phase, skipAnimation, previewMode])

  const showExplanation = phase === 'explanation' || phase === 'done'

  const correctOptionIndex = question.options.findIndex(
    (option) => option.id === question.correctOptionId,
  )
  const correctOption = question.options[correctOptionIndex]
  const correctLetter =
    OPTION_LETTERS[correctOptionIndex] ?? String(correctOptionIndex + 1)

  const wrongExplanation =
    question.wrongExplanations[feedback.selectedOptionId] ??
    feedback.explanation

  const questionTitleId = `review-q-${question.id}-title`

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
    <section
      aria-labelledby={questionTitleId}
      className="bg-white rounded-2xl shadow-sm p-4 print:break-inside-avoid dark:bg-gray-900 dark:shadow-none dark:border dark:border-gray-800"
    >
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
          {feedback.isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
        </Badge>
        <Badge variant="default" size="sm">
          {t('results.pointsScore', {
            awarded: feedback.pointsAwarded,
            total: maxPoints,
          })}
        </Badge>
      </div>

      <h3
        id={questionTitleId}
        className="mt-2 text-lg font-semibold leading-relaxed text-text-primary dark:text-gray-100"
      >
        <FormattedText text={question.questionText} />
      </h3>

      {!previewMode && voiceEnabled && isSupported && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 print:hidden"
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
            displayVariant={getDisplayVariant(
              phase,
              option.id === question.correctOptionId,
              option.id === feedback.selectedOptionId,
            )}
          />
        ))}
      </div>

      {!previewMode ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-4 print:hidden"
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
      ) : null}

      <div
        className={clsx(
          'mt-3 flex flex-col gap-3',
          !previewMode && !expanded && 'hidden print:block',
        )}
      >
        {feedback.isCorrect ? (
          <motion.div
            className="border-l-4 border-success-500 bg-success-50 py-3 pl-4 dark:bg-success-950/40"
            variants={explanationVariants}
            initial={skipAnimation ? 'visible' : 'hidden'}
            animate={showExplanation ? 'visible' : 'hidden'}
          >
            <p className="text-sm text-success-600 dark:text-success-400">
              <span className="sr-only">{t('quiz.explanation')}:</span>
              <span className="font-semibold">
                ✓ {t('results.whyCorrect')}
              </span>{' '}
              {question.explanation}
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="border-l-4 border-danger-500 bg-danger-50 py-3 pl-4 dark:bg-danger-950/40"
              variants={explanationVariants}
              initial={skipAnimation ? 'visible' : 'hidden'}
              animate={showExplanation ? 'visible' : 'hidden'}
            >
              <p className="text-sm text-danger-600 dark:text-danger-400">
                <span className="sr-only">{t('quiz.explanation')}:</span>
                <span className="font-semibold">
                  ✗ {t('results.whyWrong')}
                </span>{' '}
                {wrongExplanation}
              </p>
            </motion.div>
            <motion.div
              className="border-l-4 border-success-500 bg-success-50 py-3 pl-4 dark:bg-success-950/40"
              variants={explanationVariants}
              initial={skipAnimation ? 'visible' : 'hidden'}
              animate={showExplanation ? 'visible' : 'hidden'}
            >
              <p className="text-sm text-success-600 dark:text-success-400">
                <span className="sr-only">{t('quiz.explanation')}:</span>
                <span className="font-semibold">✓ </span>
                {t('results.correctAnswerIs', {
                  letter: correctLetter,
                  text: correctOption?.text ?? '',
                })}
                {question.explanation}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}

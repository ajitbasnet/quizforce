import clsx from 'clsx'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { Check, CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useMotionSpring, useReducedMotion } from '../../hooks/useReducedMotion'
import { useVoice } from '../../hooks/useVoice'
import type { QuizOption, SupportedLanguage } from '../../types/quiz'
import { FormattedText } from '../../utils/markdownLite'
import { MOTION } from '../../utils/motionTokens'
import {
  getAnswerFeedbackContainerClasses,
  getAnswerFeedbackIcon,
  getAnswerFeedbackLabelKey,
  getAnswerFeedbackTextClasses,
  resolveAnswerFeedbackVariant,
  type AnswerFeedbackVariant,
} from '../../utils/answerFeedbackStyles'

export interface AnswerOptionProps {
  option: QuizOption
  letter: string
  isSelected: boolean
  isSubmitted: boolean
  isCorrect: boolean
  onSelect: () => void
  feedback: string | null
  voiceEnabled?: boolean
  language?: SupportedLanguage
  showFeedbackLabels?: boolean
}

function getLetterChipClasses(
  isSelected: boolean,
  isSubmitted: boolean,
  variant: AnswerFeedbackVariant | null,
): string {
  if (isSubmitted && variant) {
    switch (variant) {
      case 'correct':
        return 'bg-success-600 text-white'
      case 'wrongSelected':
        return 'bg-danger-600 text-white'
      case 'dimmed':
        return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
    }
  }
  if (isSelected) {
    return 'bg-brand-600 text-white'
  }
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
}

function getLabelClasses(variant: AnswerFeedbackVariant): string {
  switch (variant) {
    case 'correct':
      return 'font-bold text-success-600'
    case 'wrongSelected':
      return 'font-bold text-danger-600'
    case 'dimmed':
      return ''
  }
}

function getExplanationClasses(variant: AnswerFeedbackVariant): string {
  switch (variant) {
    case 'correct':
      return 'text-success-600'
    case 'wrongSelected':
      return 'text-danger-600'
    case 'dimmed':
      return 'text-gray-500 dark:text-gray-400'
  }
}

function getButtonClasses(
  isSelected: boolean,
  isSubmitted: boolean,
  variant: AnswerFeedbackVariant | null,
): string {
  if (isSubmitted && variant) {
    return getAnswerFeedbackContainerClasses(variant)
  }
  if (isSelected) {
    return 'border-brand-600 bg-brand-50 dark:bg-indigo-950/40 dark:border-indigo-400'
  }
  return 'border-gray-200 bg-surface hover:border-brand-500 hover:bg-brand-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-400 dark:hover:bg-gray-800'
}

function AnswerOptionInner({
  option,
  letter,
  isSelected,
  isSubmitted,
  isCorrect,
  onSelect,
  feedback,
  voiceEnabled,
  language,
  showFeedbackLabels = false,
}: AnswerOptionProps) {
  const { t } = useLanguage()
  const { speak } = useVoice()
  const prefersReducedMotion = useReducedMotion()
  const selectionSpring = useMotionSpring()
  const feedbackId = `feedback-${option.id}`

  const variant = isSubmitted
    ? resolveAnswerFeedbackVariant(isCorrect, isSelected)
    : null
  const labelKey = variant ? getAnswerFeedbackLabelKey(variant) : null
  const icon = variant ? getAnswerFeedbackIcon(variant) : null

  const handleVoiceRead = () => {
    if (!voiceEnabled || isSubmitted) return
    speak(option.text, language)
  }

  const showSelectedCheck = isSelected && !isSubmitted
  const showSelectionRing = isSelected && !isSubmitted
  const showCorrectPulse = isSubmitted && variant === 'correct'
  const optionLabel = `${letter}. ${option.text}`

  const scaleAnimation = prefersReducedMotion
    ? 1
    : showCorrectPulse
      ? [1, 1.02, 1]
      : showSelectionRing
        ? [0.98, 1.02, 1]
        : 1

  const scaleTransition = showCorrectPulse
    ? { duration: MOTION.fast, ease: MOTION.easeEmphasis }
    : selectionSpring

  return (
    <motion.button
      type="button"
      role="radio"
      data-testid="answer-option"
      aria-checked={isSelected}
      aria-label={optionLabel}
      aria-describedby={isSubmitted && feedback ? feedbackId : undefined}
      disabled={isSubmitted}
      onClick={onSelect}
      onMouseEnter={handleVoiceRead}
      onFocus={handleVoiceRead}
      whileTap={isSubmitted ? undefined : { scale: 0.98 }}
      animate={{ scale: scaleAnimation }}
      transition={scaleTransition}
      className={clsx(
        'relative flex min-h-11 w-full flex-col rounded-lg border px-4 py-3 text-left transition-[color,background-color,border-color] duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        getButtonClasses(isSelected, isSubmitted, variant),
      )}
    >
      {showSelectionRing && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-brand-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      {isSubmitted && showFeedbackLabels && labelKey && variant && (
        <p className={clsx('relative z-10 mb-2 text-sm', getLabelClasses(variant))}>
          {t(labelKey)}
        </p>
      )}
      <div className="relative z-10 flex w-full items-start gap-3">
        <span
          className={clsx(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            getLetterChipClasses(isSelected, isSubmitted, variant),
          )}
        >
          {letter}
        </span>
        <span
          className={clsx(
            'flex-1 break-words',
            variant && getAnswerFeedbackTextClasses(variant),
          )}
        >
          <FormattedText text={option.text} />
        </span>
        {showSelectedCheck && (
          <Check className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
        )}
        {icon === 'check' && (
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-success-600"
            aria-hidden
          />
        )}
        {icon === 'x' && (
          <XCircle className="h-5 w-5 shrink-0 text-danger-600" aria-hidden />
        )}
      </div>
      {isSubmitted && feedback && variant && (
        <p
          id={feedbackId}
          className={clsx('relative z-10 mt-2 pl-11 text-sm', getExplanationClasses(variant))}
        >
          <FormattedText text={feedback} />
        </p>
      )}
    </motion.button>
  )
}

function answerOptionPropsAreEqual(
  prev: AnswerOptionProps,
  next: AnswerOptionProps,
): boolean {
  return (
    prev.isSelected === next.isSelected &&
    prev.isSubmitted === next.isSubmitted &&
    prev.isCorrect === next.isCorrect &&
    prev.option.id === next.option.id &&
    prev.feedback === next.feedback
  )
}

export const AnswerOption = memo(AnswerOptionInner, answerOptionPropsAreEqual)

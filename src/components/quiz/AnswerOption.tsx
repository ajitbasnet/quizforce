import clsx from 'clsx'
import { Check, CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { useVoice } from '../../hooks/useVoice'
import type { QuizOption, SupportedLanguage } from '../../types/quiz'
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
        return 'bg-green-600 text-white'
      case 'wrongSelected':
        return 'bg-red-600 text-white'
      case 'dimmed':
        return 'bg-gray-100 text-gray-500'
    }
  }
  if (isSelected) {
    return 'bg-indigo-600 text-white'
  }
  return 'bg-gray-100 text-gray-700'
}

function getLabelClasses(variant: AnswerFeedbackVariant): string {
  switch (variant) {
    case 'correct':
      return 'font-bold text-green-600'
    case 'wrongSelected':
      return 'font-bold text-red-600'
    case 'dimmed':
      return ''
  }
}

function getExplanationClasses(variant: AnswerFeedbackVariant): string {
  switch (variant) {
    case 'correct':
      return 'text-green-700'
    case 'wrongSelected':
      return 'text-red-700'
    case 'dimmed':
      return 'text-gray-500'
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
    return 'border-indigo-600 bg-indigo-50'
  }
  return 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'
}

export function AnswerOption({
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

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-describedby={isSubmitted && feedback ? feedbackId : undefined}
      disabled={isSubmitted}
      onClick={onSelect}
      onMouseEnter={handleVoiceRead}
      onFocus={handleVoiceRead}
      className={clsx(
        'flex min-h-11 w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
        getButtonClasses(isSelected, isSubmitted, variant),
      )}
    >
      {isSubmitted && showFeedbackLabels && labelKey && variant && (
        <p className={clsx('mb-2 text-sm', getLabelClasses(variant))}>
          {t(labelKey)}
        </p>
      )}
      <div className="flex w-full items-center gap-3">
        <span
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            getLetterChipClasses(isSelected, isSubmitted, variant),
          )}
        >
          {letter}
        </span>
        <span
          className={clsx(
            'flex-1',
            variant && getAnswerFeedbackTextClasses(variant),
          )}
        >
          {option.text}
        </span>
        {showSelectedCheck && (
          <Check className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden />
        )}
        {icon === 'check' && (
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-green-600"
            aria-hidden
          />
        )}
        {icon === 'x' && (
          <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
        )}
      </div>
      {isSubmitted && feedback && variant && (
        <p
          id={feedbackId}
          className={clsx('mt-2 pl-11 text-sm', getExplanationClasses(variant))}
        >
          {feedback}
        </p>
      )}
    </button>
  )
}

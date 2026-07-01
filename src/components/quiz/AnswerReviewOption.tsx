import clsx from 'clsx'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import { FormattedText } from '../../utils/markdownLite'
import {
  getAnswerFeedbackContainerClasses,
  getAnswerFeedbackIcon,
  getAnswerFeedbackLabelKey,
  getAnswerFeedbackTextClasses,
  resolveAnswerFeedbackVariant,
  type AnswerFeedbackVariant,
} from '../../utils/answerFeedbackStyles'

export interface AnswerReviewOptionProps {
  letter: string
  text: string
  isCorrect: boolean
  isSelected: boolean
  explanation?: string | null
  showLabel?: boolean
  displayVariant?: AnswerFeedbackVariant
}

function getLetterChipClasses(variant: AnswerFeedbackVariant): string {
  switch (variant) {
    case 'correct':
      return 'bg-success-600 text-white'
    case 'wrongSelected':
      return 'bg-danger-600 text-white'
    case 'dimmed':
      return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
  }
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

export function AnswerReviewOption({
  letter,
  text,
  isCorrect,
  isSelected,
  explanation,
  showLabel = true,
  displayVariant,
}: AnswerReviewOptionProps) {
  const { t } = useLanguage()
  const variant =
    displayVariant ?? resolveAnswerFeedbackVariant(isCorrect, isSelected)
  const labelKey = getAnswerFeedbackLabelKey(variant)
  const icon = getAnswerFeedbackIcon(variant)

  return (
    <div
      className={clsx(
        'flex w-full flex-col rounded-lg px-4 py-3 transition-[background-color,border-color,color] duration-[400ms] ease-in-out',
        getAnswerFeedbackContainerClasses(variant),
      )}
    >
      {showLabel && labelKey && (
        <p className={clsx('mb-2 text-sm', getLabelClasses(variant))}>
          {t(labelKey)}
        </p>
      )}
      <div className="flex w-full items-start gap-3">
        <span
          className={clsx(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            getLetterChipClasses(variant),
          )}
        >
          {letter}
        </span>
        <span
          className={clsx(
            'flex-1 break-words',
            getAnswerFeedbackTextClasses(variant),
          )}
        >
          <FormattedText text={text} />
        </span>
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
      {explanation && (
        <p
          className={clsx(
            'mt-2 pl-11 text-sm',
            getExplanationClasses(variant),
          )}
        >
          <FormattedText text={explanation} />
        </p>
      )}
    </div>
  )
}

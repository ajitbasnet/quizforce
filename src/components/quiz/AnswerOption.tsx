import clsx from 'clsx'
import { Check, CheckCircle, XCircle } from 'lucide-react'
import { useVoice } from '../../hooks/useVoice'
import type { QuizOption, SupportedLanguage } from '../../types/quiz'

export interface AnswerOptionProps {
  option: QuizOption
  letter: string
  isSelected: boolean
  isSubmitted: boolean
  isCorrect: boolean
  onSelect: () => void
  feedback: string | null
  voiceEnabled?: boolean
  voiceRate?: number
  voicePitch?: number
  language?: SupportedLanguage
}

function getButtonClasses(
  isSelected: boolean,
  isSubmitted: boolean,
  isCorrect: boolean,
): string {
  if (isSubmitted && isCorrect) {
    return 'border-green-500 bg-green-50 font-bold text-green-700'
  }
  if (isSubmitted && !isCorrect && isSelected) {
    return 'border-red-500 bg-red-50 text-red-700'
  }
  if (isSubmitted && !isCorrect && !isSelected) {
    return 'border-gray-200 opacity-60'
  }
  if (isSelected) {
    return 'border-indigo-600 bg-indigo-50'
  }
  return 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50'
}

function getLetterChipClasses(
  isSelected: boolean,
  isSubmitted: boolean,
  isCorrect: boolean,
): string {
  if (isSubmitted && isCorrect) {
    return 'bg-green-600 text-white'
  }
  if (isSubmitted && !isCorrect && isSelected) {
    return 'bg-red-600 text-white'
  }
  if (isSelected) {
    return 'bg-indigo-600 text-white'
  }
  return 'bg-gray-100 text-gray-700'
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
  voiceRate,
  voicePitch,
  language,
}: AnswerOptionProps) {
  const { speak } = useVoice()
  const feedbackId = `feedback-${option.id}`

  const handleVoiceRead = () => {
    if (!voiceEnabled || isSubmitted) return
    speak(option.text, { rate: voiceRate, pitch: voicePitch, lang: language })
  }

  const showSelectedCheck = isSelected && !isSubmitted
  const showCorrectIcon = isSubmitted && isCorrect
  const showWrongIcon = isSubmitted && !isCorrect && isSelected

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
        'flex w-full flex-col rounded-lg border px-4 py-3 text-left transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
        getButtonClasses(isSelected, isSubmitted, isCorrect),
      )}
    >
      <div className="flex w-full items-center gap-3">
        <span
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            getLetterChipClasses(isSelected, isSubmitted, isCorrect),
          )}
        >
          {letter}
        </span>
        <span className="flex-1">{option.text}</span>
        {showSelectedCheck && (
          <Check className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden />
        )}
        {showCorrectIcon && (
          <CheckCircle
            className="h-5 w-5 shrink-0 text-green-600"
            aria-hidden
          />
        )}
        {showWrongIcon && (
          <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />
        )}
      </div>
      {isSubmitted && feedback && (
        <p
          id={feedbackId}
          className={clsx(
            'mt-2 pl-11 text-sm',
            isCorrect ? 'text-green-700' : 'text-red-700',
          )}
        >
          {feedback}
        </p>
      )}
    </button>
  )
}

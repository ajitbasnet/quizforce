import clsx from 'clsx'

export interface AnswerOptionProps {
  letter: string
  label: string
  isSelected: boolean
  onSelect: () => void
  disabled?: boolean
  isSubmitted?: boolean
}

export function AnswerOption({
  letter,
  label,
  isSelected,
  onSelect,
  disabled = false,
  isSubmitted = false,
}: AnswerOptionProps) {
  const isDisabled = disabled || isSubmitted

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      className={clsx(
        'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
        isSelected
          ? 'border-indigo-600 ring-2 ring-indigo-600 ring-offset-2'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
        isDisabled && 'pointer-events-none opacity-50',
      )}
    >
      <span
        className={clsx(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700',
        )}
      >
        {letter}
      </span>
      <span className="text-text-primary">{label}</span>
    </button>
  )
}

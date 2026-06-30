export type AnswerFeedbackVariant = 'correct' | 'wrongSelected' | 'dimmed'

export function resolveAnswerFeedbackVariant(
  isCorrect: boolean,
  isSelected: boolean,
): AnswerFeedbackVariant {
  if (isCorrect) return 'correct'
  if (isSelected) return 'wrongSelected'
  return 'dimmed'
}

const CONTAINER_CLASSES: Record<AnswerFeedbackVariant, string> = {
  correct: 'border-2 border-success-500 bg-success-50',
  wrongSelected: 'border-2 border-danger-500 bg-danger-50',
  dimmed: 'border border-gray-200 bg-surface-muted',
}

const TEXT_CLASSES: Record<AnswerFeedbackVariant, string> = {
  correct: 'text-success-600 font-bold',
  wrongSelected: 'text-danger-600',
  dimmed: 'text-gray-500',
}

const LABEL_KEYS: Record<AnswerFeedbackVariant, string | null> = {
  correct: 'feedback.correctAnswer',
  wrongSelected: 'feedback.yourAnswerIncorrect',
  dimmed: null,
}

const ICONS: Record<AnswerFeedbackVariant, 'check' | 'x' | null> = {
  correct: 'check',
  wrongSelected: 'x',
  dimmed: null,
}

export function getAnswerFeedbackContainerClasses(
  variant: AnswerFeedbackVariant,
): string {
  return CONTAINER_CLASSES[variant]
}

export function getAnswerFeedbackTextClasses(
  variant: AnswerFeedbackVariant,
): string {
  return TEXT_CLASSES[variant]
}

export function getAnswerFeedbackLabelKey(
  variant: AnswerFeedbackVariant,
): string | null {
  return LABEL_KEYS[variant]
}

export function getAnswerFeedbackIcon(
  variant: AnswerFeedbackVariant,
): 'check' | 'x' | null {
  return ICONS[variant]
}

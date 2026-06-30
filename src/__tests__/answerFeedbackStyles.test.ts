import { describe, expect, it } from 'vitest'
import {
  getAnswerFeedbackContainerClasses,
  getAnswerFeedbackIcon,
  getAnswerFeedbackLabelKey,
  getAnswerFeedbackTextClasses,
  resolveAnswerFeedbackVariant,
} from '../utils/answerFeedbackStyles'

describe('answerFeedbackStyles', () => {
  it('resolves correct, wrong selected, and dimmed variants', () => {
    expect(resolveAnswerFeedbackVariant(true, true)).toBe('correct')
    expect(resolveAnswerFeedbackVariant(false, true)).toBe('wrongSelected')
    expect(resolveAnswerFeedbackVariant(false, false)).toBe('dimmed')
  })

  it('returns container classes per variant', () => {
    expect(getAnswerFeedbackContainerClasses('correct')).toContain('success')
    expect(getAnswerFeedbackContainerClasses('wrongSelected')).toContain('danger')
    expect(getAnswerFeedbackContainerClasses('dimmed')).toContain('gray')
  })

  it('returns text classes and icons per variant', () => {
    expect(getAnswerFeedbackTextClasses('correct')).toContain('font-bold')
    expect(getAnswerFeedbackIcon('correct')).toBe('check')
    expect(getAnswerFeedbackIcon('wrongSelected')).toBe('x')
    expect(getAnswerFeedbackIcon('dimmed')).toBeNull()
  })

  it('returns label keys only for correct and wrong selected', () => {
    expect(getAnswerFeedbackLabelKey('correct')).toBe('feedback.correctAnswer')
    expect(getAnswerFeedbackLabelKey('wrongSelected')).toBe(
      'feedback.yourAnswerIncorrect',
    )
    expect(getAnswerFeedbackLabelKey('dimmed')).toBeNull()
  })
})

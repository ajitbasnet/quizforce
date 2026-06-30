import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnswerOption } from '../components/quiz/AnswerOption'
import type { QuizOption } from '../types/quiz'

vi.mock('../hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('../hooks/useVoice', () => ({
  useVoice: () => ({
    speak: vi.fn(),
  }),
}))

const option: QuizOption = {
  id: 'opt-1',
  text: 'Paris',
}

describe('AnswerOption', () => {
  it('shows selected styling before submit', () => {
    render(
      <AnswerOption
        option={option}
        letter="A"
        isSelected
        isSubmitted={false}
        isCorrect
        onSelect={() => {}}
        feedback={null}
      />,
    )

    const button = screen.getByRole('radio', { name: 'A. Paris' })
    expect(button.className).toContain('border-brand-600')
  })

  it('shows green styling for correct answer after submit', () => {
    render(
      <AnswerOption
        option={option}
        letter="A"
        isSelected
        isSubmitted
        isCorrect
        onSelect={() => {}}
        feedback="Because Paris is the capital."
        showFeedbackLabels
      />,
    )

    const button = screen.getByRole('radio', { name: 'A. Paris' })
    expect(button).toBeDisabled()
    expect(button.className).toContain('border-success-500')
    expect(screen.getByText('feedback.correctAnswer')).toBeInTheDocument()
    expect(screen.getByText('Because Paris is the capital.')).toBeInTheDocument()
  })

  it('shows red styling for a wrong selected answer after submit', () => {
    render(
      <AnswerOption
        option={option}
        letter="B"
        isSelected
        isSubmitted
        isCorrect={false}
        onSelect={() => {}}
        feedback="That is incorrect."
        showFeedbackLabels
      />,
    )

    const button = screen.getByRole('radio', { name: 'B. Paris' })
    expect(button.className).toContain('border-danger-500')
    expect(screen.getByText('feedback.yourAnswerIncorrect')).toBeInTheDocument()
  })

  it('dims unselected wrong answers after submit', () => {
    render(
      <AnswerOption
        option={option}
        letter="C"
        isSelected={false}
        isSubmitted
        isCorrect={false}
        onSelect={() => {}}
        feedback={null}
      />,
    )

    const button = screen.getByRole('radio', { name: 'C. Paris' })
    expect(button.className).toContain('bg-surface-muted')
    const optionText = button.querySelector('.flex-1')
    expect(optionText?.className).toContain('text-gray-500')
  })
})

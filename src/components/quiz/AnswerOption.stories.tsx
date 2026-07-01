import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import type { QuizOption } from '../../types/quiz'
import { AnswerOption } from './AnswerOption'

const mockOption: QuizOption = {
  id: 'opt-1',
  text: 'Photosynthesis converts light energy into chemical energy stored in glucose.',
}

const meta = {
  title: 'Quiz/AnswerOption',
  component: AnswerOption,
  tags: ['autodocs'],
  args: {
    option: mockOption,
    letter: 'A',
    isSelected: false,
    isSubmitted: false,
    isCorrect: false,
    onSelect: fn(),
    feedback: null,
    showFeedbackLabels: false,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AnswerOption>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: {
    isSelected: true,
  },
}

export const SubmittedCorrect: Story = {
  args: {
    isSelected: true,
    isSubmitted: true,
    isCorrect: true,
    showFeedbackLabels: true,
    feedback: 'Correct — plants use chlorophyll to capture light for photosynthesis.',
  },
}

export const SubmittedWrong: Story = {
  args: {
    isSelected: true,
    isSubmitted: true,
    isCorrect: false,
    showFeedbackLabels: true,
    feedback: 'That describes cellular respiration, not photosynthesis.',
  },
}

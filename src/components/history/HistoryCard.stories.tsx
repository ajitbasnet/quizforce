import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { makeAttempt, makeQuiz } from '../../__tests__/fixtures/quiz'
import { HistoryCard } from './HistoryCard'

const baseQuiz = makeQuiz({
  title: 'Introduction to Photosynthesis',
  description: 'Test your knowledge of how plants convert light into energy.',
  tags: ['biology', 'science'],
})

const attempt = makeAttempt(baseQuiz)

const meta = {
  title: 'History/HistoryCard',
  component: HistoryCard,
  tags: ['autodocs'],
  args: {
    onDelete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoryCard>

export default meta
type Story = StoryObj<typeof meta>

export const WithAttempt: Story = {
  args: {
    quiz: baseQuiz,
    latestAttempt: attempt,
  },
}

export const WithoutAttempt: Story = {
  args: {
    quiz: makeQuiz({
      id: 'quiz-no-attempt',
      title: 'World History Overview',
      description: 'Not yet taken — start when you are ready.',
      sourceType: 'pdf',
    }),
    latestAttempt: null,
  },
}

export const Favorited: Story = {
  args: {
    quiz: {
      ...baseQuiz,
      id: 'quiz-favorited',
      isFavorited: true,
      tags: ['biology', 'favorites'],
    },
    latestAttempt: {
      ...attempt,
      id: 'attempt-favorited',
      percentage: 78,
      score: 23,
    },
  },
}

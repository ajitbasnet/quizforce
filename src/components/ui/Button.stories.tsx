import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const VARIANTS = ['primary', 'secondary', 'danger', 'ghost', 'success'] as const
const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: VARIANTS,
    },
    size: {
      control: 'select',
      options: SIZES,
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
}

export const VariantMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted dark:text-gray-400">
            {variant}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} isLoading>
          {variant}
        </Button>
      ))}
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const VARIANTS = ['default', 'success', 'danger', 'warning', 'info'] as const
const SIZES = ['sm', 'md'] as const

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Badge',
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
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default',
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
              <Badge key={size} variant={variant} size={size}>
                {variant} {size}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

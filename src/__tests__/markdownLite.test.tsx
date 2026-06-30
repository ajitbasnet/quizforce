import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormattedText } from '../utils/markdownLite'

describe('FormattedText', () => {
  it('renders plain text', () => {
    render(<FormattedText text="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders inline code spans', () => {
    render(<FormattedText text="Use `const x = 1` here" />)
    const code = screen.getByText('const x = 1')
    expect(code.tagName).toBe('CODE')
    expect(code).toHaveClass('font-mono')
  })

  it('renders bold segments', () => {
    render(<FormattedText text="This is **important** text" />)
    const strong = screen.getByText('important')
    expect(strong.tagName).toBe('STRONG')
  })

  it('sets dir="auto" on the wrapper', () => {
    const { container } = render(<FormattedText text="مرحبا" />)
    expect(container.firstChild).toHaveAttribute('dir', 'auto')
  })

  it('handles mixed formatting in one string', () => {
    render(<FormattedText text="**Bold** and `code` together" />)
    expect(screen.getByText('Bold').tagName).toBe('STRONG')
    expect(screen.getByText('code').tagName).toBe('CODE')
    expect(screen.getByText(/and/)).toBeInTheDocument()
  })
})

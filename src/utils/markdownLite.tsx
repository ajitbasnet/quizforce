import type { ReactNode } from 'react'

// SECURITY: Renders structured React elements only — no raw HTML injection.

const CODE_CLASS =
  'font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm'

function parseMarkdownLite(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < text.length) {
    const codeMatch = text.slice(i).match(/^`([^`]+)`/)
    if (codeMatch) {
      nodes.push(
        <code key={key++} className={CODE_CLASS}>
          {codeMatch[1]}
        </code>,
      )
      i += codeMatch[0].length
      continue
    }

    const boldMatch = text.slice(i).match(/^\*\*([^*]+)\*\*/)
    if (boldMatch) {
      nodes.push(<strong key={key++}>{boldMatch[1]}</strong>)
      i += boldMatch[0].length
      continue
    }

    const nextSpecial = text.slice(i).search(/[`*]/)
    if (nextSpecial === -1) {
      nodes.push(text.slice(i))
      break
    }
    if (nextSpecial > 0) {
      nodes.push(text.slice(i, i + nextSpecial))
      i += nextSpecial
      continue
    }

    nodes.push(text[i])
    i++
  }

  return nodes
}

export interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className }: FormattedTextProps) {
  return (
    <span className={className} dir="auto">
      {parseMarkdownLite(text)}
    </span>
  )
}

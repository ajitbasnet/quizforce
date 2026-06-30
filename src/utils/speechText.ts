const MAX_CHUNK_LENGTH = 3500

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  const sentences = trimmed.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if (!current) {
      current = sentence
      continue
    }

    const combined = `${current} ${sentence}`
    if (combined.length <= MAX_CHUNK_LENGTH) {
      current = combined
    } else {
      chunks.push(current)
      current = sentence
    }
  }

  if (current) chunks.push(current)
  return chunks
}

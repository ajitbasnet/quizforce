import clsx from 'clsx'
import { X } from 'lucide-react'
import { useCallback, useState, type KeyboardEvent } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { getTagColorClass } from '../../utils/tagColors'

const MAX_TAGS = 5
const MAX_TAG_LENGTH = 20

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  className?: string
}

export function TagInput({ tags, onChange, className }: TagInputProps) {
  const { t } = useLanguage()
  const [input, setInput] = useState('')

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim().slice(0, MAX_TAG_LENGTH)
      if (!tag || tags.includes(tag) || tags.length >= MAX_TAGS) return
      onChange([...tags, tag])
      setInput('')
    },
    [onChange, tags],
  )

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag))
    },
    [onChange, tags],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        addTag(input)
      } else if (event.key === 'Backspace' && !input && tags.length > 0) {
        onChange(tags.slice(0, -1))
      }
    },
    [addTag, input, onChange, tags],
  )

  const canAddMore = tags.length < MAX_TAGS

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-text-muted">
        {t('history.addTag')}
      </span>
      <div
        className={clsx(
          'flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 py-1.5',
          'focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20',
        )}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={clsx(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              getTagColorClass(tag),
            )}
          >
            #{tag}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-black/10"
              aria-label={`${t('history.removeTag')}: ${tag}`}
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        {canAddMore ? (
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value.slice(0, MAX_TAG_LENGTH))
            }
            onKeyDown={handleKeyDown}
            placeholder={t('history.tagPlaceholder')}
            className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm text-text-primary outline-none placeholder:text-text-muted"
            aria-label={t('history.tagPlaceholder')}
          />
        ) : null}
      </div>
    </div>
  )
}

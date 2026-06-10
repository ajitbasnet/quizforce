import clsx from 'clsx'
import { Check, Globe } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { LANGUAGE_OPTIONS } from '../../i18n'
import type { SupportedLanguage } from '../../types/quiz'

interface LanguageSelectorProps {
  className?: string
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { t, changeLanguage, currentLang } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(() =>
    LANGUAGE_OPTIONS.findIndex((option) => option.code === currentLang),
  )

  const selectedIndex = LANGUAGE_OPTIONS.findIndex(
    (option) => option.code === currentLang,
  )
  const selectedOption =
    LANGUAGE_OPTIONS[selectedIndex >= 0 ? selectedIndex : 0] ?? LANGUAGE_OPTIONS[0]

  const close = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  const selectLanguage = useCallback(
    (code: SupportedLanguage) => {
      void changeLanguage(code)
      close()
    },
    [changeLanguage, close],
  )

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close])

  useEffect(() => {
    if (open) {
      setHighlightIndex(selectedIndex >= 0 ? selectedIndex : 0)
    }
  }, [open, selectedIndex])

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightIndex(
          (prev) => (prev + 1) % LANGUAGE_OPTIONS.length,
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightIndex(
          (prev) =>
            (prev - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length,
        )
        break
      case 'Home':
        event.preventDefault()
        setHighlightIndex(0)
        break
      case 'End':
        event.preventDefault()
        setHighlightIndex(LANGUAGE_OPTIONS.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        selectLanguage(LANGUAGE_OPTIONS[highlightIndex].code)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
    }
  }

  return (
    <div ref={containerRef} className={clsx('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('settings.language')}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex items-center gap-1.5">
          <span aria-hidden>{selectedOption.flag}</span>
          <span>{selectedOption.nativeName}</span>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('settings.language')}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute right-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg focus:outline-none"
        >
          {LANGUAGE_OPTIONS.map((option, index) => {
            const isSelected = option.code === currentLang
            const isHighlighted = index === highlightIndex

            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={clsx(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  isHighlighted && 'bg-gray-50',
                  isSelected && 'bg-indigo-50 text-indigo-600',
                  !isSelected && 'text-text-primary hover:bg-gray-50',
                )}
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectLanguage(option.code)}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {option.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{option.nativeName}</span>
                  <span className="block text-xs text-text-muted">
                    {option.englishName}
                  </span>
                </span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

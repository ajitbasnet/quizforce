import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Upload,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

export type InputMode = 'text' | 'pdf' | 'prompt'

interface InputModeTabsProps {
  mode: InputMode
  onModeChange: (mode: InputMode) => void
}

type TabConfig = {
  mode: InputMode
  labelKey: string
  icon: LucideIcon
}

const TABS: TabConfig[] = [
  { mode: 'text', labelKey: 'input.tabText', icon: FileText },
  { mode: 'pdf', labelKey: 'input.tabPdf', icon: Upload },
  { mode: 'prompt', labelKey: 'input.tabPrompt', icon: Sparkles },
]

export function InputModeTabs({ mode, onModeChange }: InputModeTabsProps) {
  const { t } = useLanguage()
  const tablistRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Partial<Record<InputMode, HTMLButtonElement>>>({})

  const selectMode = useCallback(
    (nextMode: InputMode) => {
      onModeChange(nextMode)
    },
    [onModeChange],
  )

  const focusTab = (targetMode: InputMode) => {
    tabRefs.current[targetMode]?.focus()
  }

  const moveFocus = (direction: 1 | -1) => {
    const currentIndex = TABS.findIndex((tab) => tab.mode === mode)
    const nextIndex = (currentIndex + direction + TABS.length) % TABS.length
    const nextMode = TABS[nextIndex].mode
    selectMode(nextMode)
    focusTab(nextMode)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(-1)
        break
      case 'Home':
        event.preventDefault()
        selectMode(TABS[0].mode)
        focusTab(TABS[0].mode)
        break
      case 'End':
        event.preventDefault()
        selectMode(TABS[TABS.length - 1].mode)
        focusTab(TABS[TABS.length - 1].mode)
        break
    }
  }

  return (
    <div
      ref={tablistRef}
      role="tablist"
      className="flex w-full border-b border-gray-200 dark:border-gray-700"
      onKeyDown={handleKeyDown}
    >
      {TABS.map(({ mode: tabMode, labelKey, icon: Icon }) => {
        const active = mode === tabMode

        return (
          <button
            key={tabMode}
            ref={(element) => {
              if (element) {
                tabRefs.current[tabMode] = element
              } else {
                delete tabRefs.current[tabMode]
              }
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={clsx(
              'relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
              active
                ? 'text-brand-600 dark:text-indigo-400'
                : 'text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-gray-100',
            )}
            onClick={() => selectMode(tabMode)}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{t(labelKey)}</span>
            {active && (
              <motion.div
                layoutId="input-mode-tab-underline"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

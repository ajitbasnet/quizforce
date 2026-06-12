import { useEffect, useRef, type DependencyList } from 'react'

const FORM_CONTROL_SELECTOR =
  'input, textarea, select, [contenteditable="true"]'

export function isShortcutBlocked(): boolean {
  const active = document.activeElement
  if (active instanceof HTMLElement && active.closest(FORM_CONTROL_SELECTOR)) {
    return true
  }

  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null
}

export interface KeyboardHandlers {
  enabled?: boolean
  canGoPrev?: boolean
  canSelectOption?: (index: number) => boolean
  hasAnswer?: boolean
  isLastQuestion?: boolean
  onNext?: () => void
  onPrev?: () => void
  onSelectOption?: (index: number) => void
  onAdvance?: () => void
  onToggleVoice?: () => void
  onSkipVoice?: () => void
  onSubmit?: () => void
}

export function useKeyboard(handlers: KeyboardHandlers, deps: DependencyList) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const h = handlersRef.current
      if (h.enabled === false || isShortcutBlocked()) return

      const { key } = event

      if (key === 'ArrowRight') {
        h.onNext?.()
        event.preventDefault()
        return
      }

      if (key === 'ArrowLeft') {
        if (h.canGoPrev === false) return
        h.onPrev?.()
        event.preventDefault()
        return
      }

      if (key >= '1' && key <= '4') {
        const index = Number(key) - 1
        if (h.canSelectOption && !h.canSelectOption(index)) return
        h.onSelectOption?.(index)
        event.preventDefault()
        return
      }

      if (key === ' ') {
        if (!h.hasAnswer) return
        h.onAdvance?.()
        event.preventDefault()
        return
      }

      if (key === 'v' || key === 'V') {
        h.onToggleVoice?.()
        event.preventDefault()
        return
      }

      if (key === 's' || key === 'S') {
        h.onSkipVoice?.()
        event.preventDefault()
        return
      }

      if (key === 'Enter') {
        if (!h.isLastQuestion) return
        h.onSubmit?.()
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

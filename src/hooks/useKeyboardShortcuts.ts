import { useEffect, useRef, type DependencyList } from 'react'

const FORM_CONTROL_SELECTOR =
  'input, textarea, select, [contenteditable="true"]'

export type ShortcutContext = 'global' | 'quiz' | 'results' | 'history'

export interface ShortcutDef {
  id: string
  key: string
  modifier?: 'shift' | 'ctrl' | 'meta' | 'alt'
  descriptionKey: string
  context: ShortcutContext
  displayKeys: string[]
  hintKey?: string
  match?: (event: KeyboardEvent) => boolean
}

export function isShortcutBlocked(): boolean {
  const active = document.activeElement
  if (active instanceof HTMLElement && active.closest(FORM_CONTROL_SELECTOR)) {
    return true
  }

  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null
}

export const SHORTCUT_REGISTRY: ShortcutDef[] = [
  {
    id: 'open-help',
    key: '?',
    context: 'global',
    descriptionKey: 'shortcuts.openHelp',
    displayKeys: ['?'],
  },
  {
    id: 'quiz-next',
    key: 'ArrowRight',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutNext',
    displayKeys: ['→'],
  },
  {
    id: 'quiz-prev',
    key: 'ArrowLeft',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutPrev',
    displayKeys: ['←'],
  },
  {
    id: 'quiz-select',
    key: '',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutSelect',
    displayKeys: ['1', '–', '4'],
    match: (event) => event.key >= '1' && event.key <= '4',
  },
  {
    id: 'quiz-advance',
    key: ' ',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutAdvance',
    displayKeys: ['Space'],
  },
  {
    id: 'quiz-voice',
    key: 'v',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutVoice',
    displayKeys: ['V'],
  },
  {
    id: 'quiz-skip-voice',
    key: 's',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutSkipVoice',
    displayKeys: ['S'],
  },
  {
    id: 'quiz-submit',
    key: 'Enter',
    context: 'quiz',
    descriptionKey: 'quiz.shortcutSubmit',
    displayKeys: ['Enter'],
    hintKey: 'quiz.shortcutSubmitNote',
  },
  {
    id: 'results-focus-review',
    key: '/',
    context: 'results',
    descriptionKey: 'shortcuts.focusReview',
    displayKeys: ['/'],
  },
  {
    id: 'history-focus-search',
    key: '/',
    context: 'history',
    descriptionKey: 'shortcuts.focusSearch',
    displayKeys: ['/'],
  },
]

const actionMap = new Map<string, (event: KeyboardEvent) => void | false>()

function matchesShortcut(def: ShortcutDef, event: KeyboardEvent): boolean {
  if (def.modifier === 'shift' && !event.shiftKey) return false
  if (def.modifier === 'ctrl' && !event.ctrlKey) return false
  if (def.modifier === 'meta' && !event.metaKey) return false
  if (def.modifier === 'alt' && !event.altKey) return false

  if (def.match) return def.match(event)

  return (
    event.key === def.key ||
    event.key.toLowerCase() === def.key.toLowerCase()
  )
}

export function resolveShortcutContext(pathname: string): ShortcutContext {
  if (pathname === '/quiz' || pathname.startsWith('/quiz/')) return 'quiz'
  if (pathname.startsWith('/results')) return 'results'
  if (pathname.startsWith('/history')) return 'history'
  return 'global'
}

export function useRegisterShortcutActions(
  actions: Record<string, (event: KeyboardEvent) => void | false>,
  deps: DependencyList = [],
) {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    const current = actionsRef.current
    for (const [id, action] of Object.entries(current)) {
      actionMap.set(id, action)
    }

    return () => {
      for (const id of Object.keys(current)) {
        actionMap.delete(id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useKeyboardShortcuts(activeContext: ShortcutContext) {
  const contextRef = useRef(activeContext)
  contextRef.current = activeContext

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isShortcutBlocked()) return

      for (const def of SHORTCUT_REGISTRY) {
        if (def.context !== 'global' && def.context !== contextRef.current) {
          continue
        }

        if (!matchesShortcut(def, event)) continue

        const action = actionMap.get(def.id)
        if (!action) continue

        const handled = action(event)
        if (handled === false) continue

        event.preventDefault()
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}

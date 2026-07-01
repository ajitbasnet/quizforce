import { useEffect, useLayoutEffect } from 'react'
import { useNavigationType } from 'react-router-dom'

const HISTORY_SCROLL_KEY = 'quizforge:scroll:/history'

function saveScrollPosition(key: string): void {
  try {
    sessionStorage.setItem(key, String(window.scrollY))
  } catch {
    // ignore storage errors
  }
}

function readScrollPosition(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (raw === null) return null
    const y = Number(raw)
    return Number.isFinite(y) ? y : null
  } catch {
    return null
  }
}

export function useScrollRestoration(storageKey = HISTORY_SCROLL_KEY): void {
  const navigationType = useNavigationType()

  useEffect(() => {
    const onBeforeUnload = () => saveScrollPosition(storageKey)

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      saveScrollPosition(storageKey)
    }
  }, [storageKey])

  useLayoutEffect(() => {
    if (navigationType !== 'POP') return

    const y = readScrollPosition(storageKey)
    if (y === null) return

    requestAnimationFrame(() => {
      window.scrollTo(0, y)
    })
  }, [navigationType, storageKey])
}

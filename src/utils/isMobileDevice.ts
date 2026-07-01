export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false

  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true

  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  if (isIosDevice()) return true

  const isTouch =
    'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isNarrow = window.matchMedia('(max-width: 1023px)').matches

  return isTouch && isNarrow
}

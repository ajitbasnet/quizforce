import { useEffect, useRef, useState } from 'react'

export function useShakeOnError(error: unknown): boolean {
  const hadErrorRef = useRef(false)
  const [shouldShake, setShouldShake] = useState(false)

  useEffect(() => {
    const hasError = Boolean(error)

    if (hasError && !hadErrorRef.current) {
      setShouldShake(true)
      hadErrorRef.current = true
      const timer = window.setTimeout(() => setShouldShake(false), 400)
      return () => window.clearTimeout(timer)
    }

    if (!hasError) {
      hadErrorRef.current = false
    }
  }, [error])

  return shouldShake
}

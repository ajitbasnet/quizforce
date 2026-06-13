import { useEffect, useRef, useState } from 'react'
import { runCanvasConfetti } from '../../utils/runCanvasConfetti'

export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    return runCanvasConfetti(canvas, () => setDone(true))
  }, [])

  if (done) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 print:hidden"
      aria-hidden
    />
  )
}

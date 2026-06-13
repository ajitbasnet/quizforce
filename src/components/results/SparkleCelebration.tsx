import { motion } from 'framer-motion'
import { useState } from 'react'

export function SparkleCelebration() {
  const [done, setDone] = useState(false)

  if (done) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center print:hidden"
      aria-hidden
    >
      <motion.span
        className="text-8xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 3, times: [0, 0.5, 1] }}
        onAnimationComplete={() => setDone(true)}
      >
        ✨
      </motion.span>
    </div>
  )
}

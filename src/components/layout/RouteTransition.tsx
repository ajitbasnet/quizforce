import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useMotionPreset } from '../../hooks/useReducedMotion'
import { MOTION } from '../../utils/motionTokens'

export function RouteTransition() {
  const location = useLocation()
  const enterPreset = useMotionPreset('enterPage')
  const exitPreset = useMotionPreset('exitPage')

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={enterPreset.initial}
        animate={{
          ...enterPreset.animate,
          transition: enterPreset.transition ?? {
            duration: MOTION.duration.standard,
            ease: MOTION.easeStandard,
          },
        }}
        exit={{
          ...exitPreset.exit,
          transition: exitPreset.transition ?? {
            duration: MOTION.duration.exit,
            ease: MOTION.easeStandard,
          },
        }}
        className="flex min-h-[calc(100vh-4rem)] flex-col"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

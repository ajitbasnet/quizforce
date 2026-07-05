import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useMotionTransition } from '../../hooks/useReducedMotion'
import { MOTION } from '../../utils/motionTokens'

interface PageWrapperProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageWrapper({
  title,
  description,
  actions,
  children,
}: PageWrapperProps) {
  const titleTransition = useMotionTransition(
    MOTION.duration.standard,
    MOTION.easeStandard,
  )

  return (
    <div className="flex-1 overflow-auto py-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={titleTransition}
            className="mb-8 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="min-w-0 shrink-0">
              <h1 className="text-2xl font-bold text-text-primary dark:text-gray-100">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-text-muted dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="min-w-0 w-full lg:w-auto lg:max-w-3xl lg:flex-1">
                {actions}
              </div>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </div>
  )
}

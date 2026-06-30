import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

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
  return (
    <main className="flex-1 overflow-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {title && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
                {description && (
                  <p className="mt-1 text-text-muted">{description}</p>
                )}
              </div>
              {actions && (
                <div className="flex shrink-0 items-center gap-2">{actions}</div>
              )}
            </div>
          )}

          {children}
        </div>
      </motion.div>
    </main>
  )
}

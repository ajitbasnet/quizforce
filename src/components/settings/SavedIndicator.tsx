import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

interface SavedIndicatorProps {
  visible: boolean
}

export function SavedIndicator({ visible }: SavedIndicatorProps) {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-1 text-sm font-medium text-success-600"
          role="status"
          aria-live="polite"
        >
          <Check className="h-4 w-4" aria-hidden />
          {t('settings.saved')}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

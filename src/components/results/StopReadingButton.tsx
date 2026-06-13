import { Square } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'

interface StopReadingButtonProps {
  visible: boolean
  onStop: () => void
}

export function StopReadingButton({ visible, onStop }: StopReadingButtonProps) {
  const { t } = useLanguage()

  if (!visible) {
    return null
  }

  return createPortal(
    <Button
      type="button"
      variant="secondary"
      className="fixed bottom-6 right-4 z-50 min-h-11 shadow-md"
      leftIcon={<Square className="h-4 w-4" aria-hidden />}
      onClick={onStop}
    >
      {t('results.stopReading')}
    </Button>,
    document.body,
  )
}

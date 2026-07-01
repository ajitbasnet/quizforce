import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ClearHistoryModalProps {
  isOpen: boolean
  quizCount: number
  onClose: () => void
  onConfirm: () => void
}

export function ClearHistoryModal({
  isOpen,
  quizCount,
  onClose,
  onConfirm,
}: ClearHistoryModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('history.clearAllTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('results.retryCancel')}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {t('history.clearAllConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">
        {t('history.clearAllDescription', { count: quizCount })}
      </p>
    </Modal>
  )
}

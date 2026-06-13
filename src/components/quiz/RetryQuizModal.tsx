import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface RetryQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function RetryQuizModal({
  isOpen,
  onClose,
  onConfirm,
}: RetryQuizModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('results.retryTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('results.retryCancel')}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirm}>
            {t('results.retryConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">
        {t('results.retryDescription')}
      </p>
    </Modal>
  )
}

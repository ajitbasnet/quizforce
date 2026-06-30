import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface DeleteQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteQuizModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteQuizModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('history.deleteTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('results.retryCancel')}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {t('history.deleteConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">{t('history.deleteDescription')}</p>
    </Modal>
  )
}

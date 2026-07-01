import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface UnansweredQuestionsModalProps {
  isOpen: boolean
  unansweredNumbers: number[]
  onClose: () => void
  onConfirmSubmit: () => void
}

export function UnansweredQuestionsModal({
  isOpen,
  unansweredNumbers,
  onClose,
  onConfirmSubmit,
}: UnansweredQuestionsModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('quiz.unansweredTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('quiz.goBackAndAnswer')}
          </Button>
          <Button type="button" variant="primary" onClick={onConfirmSubmit}>
            {t('quiz.submitAnyway')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted dark:text-gray-400">
        {t('quiz.unansweredDescription')}
      </p>
      <ul className="mt-3 list-inside list-disc text-sm text-text-primary dark:text-gray-100">
        {unansweredNumbers.map((num) => (
          <li key={num}>{t('quiz.questionChip', { number: num })}</li>
        ))}
      </ul>
    </Modal>
  )
}

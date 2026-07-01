import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface QuizValidationErrorModalProps {
  isOpen: boolean
  rawResponse: string
  onClose: () => void
  onRetry: () => void
}

export function QuizValidationErrorModal({
  isOpen,
  rawResponse,
  onClose,
  onRetry,
}: QuizValidationErrorModalProps) {
  const { t } = useLanguage()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('quiz.validationErrorTitle')}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('quiz.close')}
          </Button>
          <Button type="button" variant="primary" onClick={onRetry}>
            {t('quiz.tryRegenerating')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted dark:text-gray-400">{t('errors.generationFailed')}</p>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-text-primary dark:text-gray-100">
          {t('quiz.rawResponse')}
        </summary>
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-text-primary dark:bg-gray-800 dark:text-gray-100">
          {rawResponse}
        </pre>
      </details>
    </Modal>
  )
}

import { Copy, Link2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import {
  buildShareCopyText,
  buildShareUrl,
  buildTwitterIntentUrl,
  buildWhatsAppIntentUrl,
  hasSupabaseSession,
} from '../../utils/shareScore'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'
import { ShareScorePreview } from './ShareScorePreview'

interface ShareScoreModalProps {
  isOpen: boolean
  onClose: () => void
  attempt: QuizAttempt
  quiz: Quiz
}

export function ShareScoreModal({
  isOpen,
  onClose,
  attempt,
  quiz,
}: ShareScoreModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    void hasSupabaseSession().then((session) => {
      if (!cancelled) {
        setIsAuthenticated(session)
      }
    })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const shareUrl = useMemo(
    () => buildShareUrl({ attempt, quiz, isAuthenticated }),
    [attempt, quiz, isAuthenticated],
  )

  const shareText = useMemo(
    () => buildShareCopyText({ attempt, quiz, t }),
    [attempt, quiz, t],
  )

  const twitterUrl = useMemo(
    () => buildTwitterIntentUrl(shareText, shareUrl),
    [shareText, shareUrl],
  )

  const whatsAppUrl = useMemo(
    () => buildWhatsAppIntentUrl(shareText, shareUrl),
    [shareText, shareUrl],
  )

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('results.linkCopied'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      toast.success(t('results.textCopied'))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('results.shareModalTitle')}
      size="lg"
    >
      <div className="flex flex-col items-center gap-6">
        <ShareScorePreview attempt={attempt} quiz={quiz} />

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leftIcon={<Link2 className="h-4 w-4" />}
            onClick={() => void handleCopyLink()}
          >
            {t('results.copyLink')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leftIcon={<Copy className="h-4 w-4" />}
            onClick={() => void handleCopyText()}
          >
            {t('results.copyText')}
          </Button>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
          >
            {t('results.shareTwitter')}
          </a>
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-900"
          >
            {t('results.shareWhatsApp')}
          </a>
        </div>
      </div>
    </Modal>
  )
}

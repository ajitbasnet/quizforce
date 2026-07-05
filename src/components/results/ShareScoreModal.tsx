import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Link2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode } from 'react'
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

const COPY_CONFIRM_MS = 2000

function CopyConfirmIcon({
  copied,
  icon,
}: {
  copied: boolean
  icon: ReactNode
}) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
            aria-hidden="true"
          >
            <Check className="h-4 w-4 text-success-600" />
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
            aria-hidden="true"
          >
            {icon}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
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
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const copyLinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copyTextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (isOpen) return

    setCopiedLink(false)
    setCopiedText(false)
    if (copyLinkTimeoutRef.current) {
      clearTimeout(copyLinkTimeoutRef.current)
      copyLinkTimeoutRef.current = null
    }
    if (copyTextTimeoutRef.current) {
      clearTimeout(copyTextTimeoutRef.current)
      copyTextTimeoutRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (copyLinkTimeoutRef.current) clearTimeout(copyLinkTimeoutRef.current)
      if (copyTextTimeoutRef.current) clearTimeout(copyTextTimeoutRef.current)
    }
  }, [])

  const showCopyConfirm = (
    setter: (value: boolean) => void,
    timeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>,
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setter(true)
    timeoutRef.current = setTimeout(() => {
      setter(false)
      timeoutRef.current = null
    }, COPY_CONFIRM_MS)
  }

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
      showCopyConfirm(setCopiedLink, copyLinkTimeoutRef)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      showCopyConfirm(setCopiedText, copyTextTimeoutRef)
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
            leftIcon={
              <CopyConfirmIcon
                copied={copiedLink}
                icon={<Link2 className="h-4 w-4" />}
              />
            }
            onClick={() => void handleCopyLink()}
            aria-live="polite"
          >
            {t('results.copyLink')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leftIcon={
              <CopyConfirmIcon
                copied={copiedText}
                icon={<Copy className="h-4 w-4" />}
              />
            }
            onClick={() => void handleCopyText()}
            aria-live="polite"
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

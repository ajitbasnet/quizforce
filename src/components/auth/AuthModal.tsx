import { AnimatePresence, motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

type AuthStep = 'email' | 'sent'

export function AuthModal() {
  const { t } = useLanguage()
  const { authModalOpen, closeAuthModal, signInWithMagicLink } = useAuth()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!authModalOpen) {
      setStep('email')
      setEmail('')
      setError(null)
      setIsSending(false)
    }
  }, [authModalOpen])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError(t('auth.invalidEmail'))
      return
    }

    setError(null)
    setIsSending(true)
    try {
      await signInWithMagicLink(trimmed)
      setStep('sent')
    } catch {
      setError(t('errors.generic'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      title={t('auth.signInTitle')}
      size="sm"
    >
      {step === 'email' ? (
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <Input
            type="email"
            autoComplete="email"
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSending}
          />
          {error && (
            <p className="text-sm text-danger-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" fullWidth isLoading={isSending}>
            {t('auth.sendMagicLink')}
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-gray-800">
                <Mail className="h-8 w-8 text-brand-600" aria-hidden />
              </div>
            </motion.div>
          </AnimatePresence>
          <p className="text-sm text-text-muted dark:text-gray-400">{t('auth.checkEmail')}</p>
          <Button type="button" variant="ghost" size="sm" onClick={closeAuthModal}>
            {t('results.retryCancel')}
          </Button>
        </div>
      )}
    </Modal>
  )
}

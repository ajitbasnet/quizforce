import { useState } from 'react'
import { getSupabaseClient } from '../../api/supabase'
import { useLanguage } from '../../hooks/useLanguage'
import { useHistoryStore } from '../../store/historyStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const resetSettings = useSettingsStore((s) => s.resetSettings)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      const supabase = getSupabaseClient()
      if (supabase) {
        await supabase.auth.signOut()
      }
      clearHistory()
      resetSettings()
      toast.success(t('settings.deleteAccountSuccess'))
      onClose()
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('settings.deleteAccountTitle')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('results.retryCancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={() => void handleConfirm()}
          >
            {t('settings.deleteAccountConfirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted dark:text-gray-400">
        {t('settings.deleteAccountDescription')}
      </p>
    </Modal>
  )
}

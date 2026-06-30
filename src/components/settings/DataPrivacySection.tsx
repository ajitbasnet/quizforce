import { Download, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ClearHistoryModal } from '../history/ClearHistoryModal'
import { useAuth } from '../../hooks/useAuth'
import { useHistory } from '../../hooks/useHistory'
import { useLanguage } from '../../hooks/useLanguage'
import { useHistoryStore } from '../../store/historyStore'
import { downloadFile } from '../../utils/downloadFile'
import {
  buildHistoryExport,
  getHistoryExportFilename,
} from '../../utils/historyExport'
import { Button } from '../ui/Button'
import { DeleteAccountModal } from './DeleteAccountModal'
import { SettingsSectionCard } from './SettingsSectionCard'

export function DataPrivacySection() {
  const { t } = useLanguage()
  const { quizzes } = useHistory()
  const allAttempts = useHistoryStore((s) => s.attempts)
  const clearHistory = useHistoryStore((s) => s.clearHistory)
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const handleExport = useCallback(() => {
    const payload = buildHistoryExport(quizzes, allAttempts)
    const filename = getHistoryExportFilename()
    downloadFile(
      JSON.stringify(payload, null, 2),
      filename,
      'application/json',
    )
  }, [allAttempts, quizzes])

  const handleClearConfirm = useCallback(() => {
    clearHistory()
    setClearModalOpen(false)
  }, [clearHistory])

  return (
    <>
      <SettingsSectionCard
        id="data"
        title={t('settings.sectionData')}
        saved={false}
      >
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
            onClick={() => setClearModalOpen(true)}
          >
            {t('history.clearAll')}
          </Button>

          <Button
            type="button"
            variant="secondary"
            leftIcon={<Download className="h-4 w-4" aria-hidden />}
            onClick={handleExport}
          >
            {t('settings.exportMyData')}
          </Button>

          {isAuthenticated && (
            <Button
              type="button"
              variant="ghost"
              className="text-danger-600 hover:bg-danger-50"
              onClick={() => setDeleteModalOpen(true)}
            >
              {t('settings.deleteAccount')}
            </Button>
          )}
        </div>
      </SettingsSectionCard>

      <ClearHistoryModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearConfirm}
      />

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  )
}

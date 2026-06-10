import clsx from 'clsx'
import { History, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsStore } from '../../store/settingsStore'
import { VoiceToggle } from '../voice/VoiceToggle'
import { LanguageSelector } from './LanguageSelector'

type MobileNavDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

const drawerLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-50 text-indigo-600'
      : 'text-text-primary hover:bg-gray-100',
  )

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { t } = useLanguage()
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={onClose}
        aria-label={t('nav.closeSidebar')}
      />
      <aside
        className={clsx(
          'fixed right-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-72 flex-col bg-white shadow-xl transition-transform duration-200 md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {t('settings.language')}
            </span>
            <LanguageSelector />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
            <span className="text-sm font-medium text-text-primary">
              {voiceEnabled ? t('voice.disable') : t('voice.enable')}
            </span>
            <VoiceToggle />
          </div>

          <nav className="flex flex-col gap-1">
            <NavLink to="/history" className={drawerLinkClass} onClick={onClose}>
              <History className="h-4 w-4" aria-hidden />
              {t('nav.history')}
            </NavLink>
            <NavLink to="/settings" className={drawerLinkClass} onClick={onClose}>
              <Settings className="h-4 w-4" aria-hidden />
              {t('nav.settings')}
            </NavLink>
          </nav>
        </div>
      </aside>
    </>
  )
}

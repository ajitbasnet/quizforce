import { History, Menu, Settings, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useSettingsStore } from '../../store/settingsStore'
import { VoiceToggle } from '../voice/VoiceToggle'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'
import { LanguageSelector } from './LanguageSelector'
import { useSidebar } from './SidebarContext'

function getBreadcrumbKey(pathname: string): string {
  if (pathname === '/') return 'nav.home'
  if (pathname === '/quiz') return 'nav.quiz'
  if (pathname.startsWith('/results/')) return 'nav.results'
  if (pathname.startsWith('/history/')) return 'history.title'
  if (pathname === '/history') return 'history.title'
  if (pathname === '/settings') return 'settings.title'
  return 'nav.home'
}

const actionLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
    isActive
      ? 'text-indigo-600 bg-indigo-50'
      : 'text-text-primary hover:bg-gray-100',
  ].join(' ')

const iconLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2',
    isActive
      ? 'text-indigo-600 bg-indigo-50'
      : 'text-text-primary hover:bg-gray-100',
  ].join(' ')

export function TopBar() {
  const { t } = useLanguage()
  const location = useLocation()
  const { openMobile } = useSidebar()
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)

  const breadcrumbKey = getBreadcrumbKey(location.pathname)

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
      >
        <Zap className="h-6 w-6 text-indigo-600" aria-hidden />
        <span className="text-lg font-bold text-text-primary">{t('app.name')}</span>
      </Link>

      <div className="hidden flex-1 justify-center lg:flex">
        <span className="text-sm text-text-muted">{t(breadcrumbKey)}</span>
      </div>

      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <Tooltip content={t('settings.language')}>
          <LanguageSelector />
        </Tooltip>

        <Tooltip content={voiceEnabled ? t('voice.disable') : t('voice.enable')}>
          <VoiceToggle />
        </Tooltip>

        <Tooltip content={t('nav.history')}>
          <NavLink to="/history" className={actionLinkClass}>
            <History className="h-4 w-4" aria-hidden />
            {t('nav.history')}
          </NavLink>
        </Tooltip>

        <Tooltip content={t('nav.settings')}>
          <NavLink
            to="/settings"
            className={iconLinkClass}
            aria-label={t('nav.settings')}
          >
            <Settings className="h-4 w-4" aria-hidden />
          </NavLink>
        </Tooltip>
      </div>

      <div className="ml-auto flex lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openMobile}
          aria-label={t('nav.menu')}
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </header>
  )
}

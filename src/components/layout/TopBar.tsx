import clsx from 'clsx'
import { History, Menu, Settings, Zap } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { UserMenu } from '../auth/UserMenu'
import { useAuth } from '../../hooks/useAuth'
import { useHistorySync } from '../../hooks/useHistorySync'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuickSettings } from '../../hooks/useQuickSettings'
import { isSpeechSupported } from '../../utils/speechSupport'
import { VoiceToggle } from '../voice/VoiceToggle'
import { Button } from '../ui/Button'
import { LanguageSelector } from './LanguageSelector'
import { topBarNavLinkClass, topBarUtilityClass } from './topBarActionStyles'
import { useSidebar } from './SidebarContext'

interface TopBarProps {
  isScrolled?: boolean
}

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
  topBarNavLinkClass(isActive)

export function TopBar({ isScrolled = false }: TopBarProps) {
  const { t } = useLanguage()
  const location = useLocation()
  const { openMobile } = useSidebar()
  const { open: openQuickSettings } = useQuickSettings()
  const { isLoading: isHistorySyncing } = useHistorySync()
  const {
    isAuthenticated,
    isConfigured,
    isLoading: isAuthLoading,
    openAuthModal,
  } = useAuth()

  const breadcrumbKey = getBreadcrumbKey(location.pathname)

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md motion-safe:transition-[background-color,box-shadow,border-color] motion-safe:duration-standard motion-safe:ease-standard lg:px-6',
        isScrolled
          ? 'border-gray-200/80 bg-white/95 shadow-elevation-1 dark:border-gray-700/80 dark:bg-gray-900/95'
          : 'border-gray-100 bg-white/80 dark:border-gray-800 dark:bg-gray-900/80',
      )}
    >
      <Link
        to="/"
        className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
      >
        <Zap className="h-6 w-6 text-brand-600" aria-hidden />
        <span className="text-lg font-bold text-text-primary dark:text-gray-100">{t('app.name')}</span>
      </Link>

      <div className="hidden flex-1 justify-center lg:flex">
        <span className="text-sm text-text-muted dark:text-gray-400">{t(breadcrumbKey)}</span>
      </div>

      <div className="ml-auto hidden items-center gap-1 lg:flex">
        {isHistorySyncing && (
          <span
            role="status"
            aria-live="polite"
            className={topBarUtilityClass({ isStatus: true })}
          >
            <span
              className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-600 border-t-transparent motion-reduce:animate-none"
              aria-hidden="true"
            />
            {t('history.syncing')}
          </span>
        )}

        <LanguageSelector variant="topBar" />

        {isSpeechSupported() && <VoiceToggle />}

        <NavLink to="/history" className={actionLinkClass}>
          <History className="h-4 w-4" aria-hidden />
          {t('nav.history')}
        </NavLink>

        <button
          type="button"
          className={topBarUtilityClass({ iconOnly: true })}
          onClick={openQuickSettings}
          aria-label={t('nav.settings')}
        >
          <Settings className="h-4 w-4" aria-hidden />
        </button>

        {isConfigured && !isAuthLoading && (
          isAuthenticated ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              className={topBarUtilityClass()}
              onClick={openAuthModal}
            >
              {t('auth.signIn')}
            </button>
          )
        )}
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

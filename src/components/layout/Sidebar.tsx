import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  BarChart2,
  ChevronLeft,
  Clock,
  PlusCircle,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useMotionSpring, useReducedMotion } from '../../hooks/useReducedMotion'
import { useHistoryStore } from '../../store/historyStore'
import { isSpeechSupported } from '../../utils/speechSupport'
import { VoiceToggle } from '../voice/VoiceToggle'
import { Tooltip } from '../ui/Tooltip'
import { LanguageSelector } from './LanguageSelector'
import {
  sidebarNavLinkClass,
  topBarUtilityClass,
} from './topBarActionStyles'
import { useSidebar } from './SidebarContext'

type NavItem = {
  labelKey: string
  icon: LucideIcon
  to: string
  end?: boolean
  isActive?: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  {
    labelKey: 'nav.home',
    icon: Sparkles,
    to: '/',
    end: true,
    isActive: (pathname) => pathname === '/',
  },
  {
    labelKey: 'nav.createQuiz',
    icon: PlusCircle,
    to: '/',
    end: true,
    isActive: (pathname) => pathname === '/',
  },
  {
    labelKey: 'nav.history',
    icon: Clock,
    to: '/history',
    isActive: (pathname) => pathname.startsWith('/history'),
  },
  {
    labelKey: 'nav.settings',
    icon: Settings,
    to: '/settings',
    isActive: (pathname) => pathname === '/settings',
  },
]

export function Sidebar() {
  const { t } = useLanguage()
  const location = useLocation()
  const prefersReducedMotion = useReducedMotion()
  const {
    isCollapsed,
    toggleCollapsed,
    isMobileOpen,
    closeMobile,
  } = useSidebar()
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)

  const showCollapsed = isCollapsed && !isMobileOpen
  const springTransition = useMotionSpring()

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attempts.length,
        )
      : 0

  const statsTooltip = `${t('sidebar.totalQuizzes', { count: quizzes.length })} · ${t('sidebar.averageScore', { score: averageScore })}`

  const primaryActiveIndex = NAV_ITEMS.findIndex((navItem) =>
    navItem.isActive?.(location.pathname),
  )

  useEffect(() => {
    if (!isMobileOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobile()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isMobileOpen, closeMobile])

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-30 bg-black/40 motion-safe:transition-opacity motion-safe:duration-standard lg:hidden"
          onClick={closeMobile}
          aria-label={t('nav.closeSidebar')}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-16 z-40 flex h-[calc(100vh-4rem)] flex-col border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
          'motion-safe:transition-[width,transform] motion-safe:duration-standard motion-safe:ease-standard',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          showCollapsed ? 'w-16 lg:w-16' : 'w-64 lg:w-64',
        )}
      >
        <div className="flex flex-col gap-2 border-b border-gray-100 p-2 dark:border-gray-800 lg:hidden">
          <LanguageSelector />
          {isSpeechSupported() && <VoiceToggle />}
        </div>

        <div className="hidden items-center justify-end border-b border-gray-100 p-2 dark:border-gray-800 lg:flex">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={topBarUtilityClass({ iconOnly: true })}
            aria-label={t('nav.toggleSidebar')}
            aria-expanded={!isCollapsed}
          >
            <ChevronLeft
              className={clsx(
                'h-4 w-4 motion-safe:transition-transform motion-safe:duration-standard motion-safe:ease-standard',
                isCollapsed && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon
            const label = t(item.labelKey)
            const isActive = item.isActive
              ? item.isActive(location.pathname)
              : false
            const showActiveBg = isActive && index === primaryActiveIndex

            const link = (
              <div className="relative">
                {showActiveBg &&
                  (prefersReducedMotion ? (
                    <div
                      className="absolute inset-0 rounded-lg bg-brand-50 dark:bg-gray-800"
                      aria-hidden
                    />
                  ) : (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-lg bg-brand-50 dark:bg-gray-800"
                      transition={{ type: 'spring', ...springTransition }}
                    />
                  ))}
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={closeMobile}
                  className={sidebarNavLinkClass(isActive, showCollapsed)}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {!showCollapsed && <span>{label}</span>}
                </NavLink>
              </div>
            )

            if (showCollapsed) {
              return (
                <Tooltip key={item.labelKey} content={label}>
                  {link}
                </Tooltip>
              )
            }

            return <div key={item.labelKey}>{link}</div>
          })}
        </nav>

        <div className="mt-auto border-t border-gray-100 p-2 dark:border-gray-800">
          {showCollapsed ? (
            <Tooltip content={statsTooltip}>
              <div className="flex justify-center rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
                <BarChart2 className="h-5 w-5 text-text-muted dark:text-gray-400" aria-hidden />
              </div>
            </Tooltip>
          ) : (
            <div className="rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-800">
              <p className="font-medium text-text-muted dark:text-gray-400">{t('sidebar.stats')}</p>
              <p className="mt-1 text-text-primary dark:text-gray-100">
                {t('sidebar.totalQuizzes', { count: quizzes.length })}
              </p>
              <p className="text-text-primary dark:text-gray-100">
                {t('sidebar.averageScore', { score: averageScore })}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

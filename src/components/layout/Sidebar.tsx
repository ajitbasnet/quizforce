import clsx from 'clsx'
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlusCircle,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import { useHistoryStore } from '../../store/historyStore'
import { useSidebarStore } from '../../store/sidebarStore'
import { Tooltip } from '../ui/Tooltip'

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

function navLinkClass(isActive: boolean, collapsed: boolean) {
  return clsx(
    'flex items-center rounded-lg text-sm font-medium transition-colors',
    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
    isActive
      ? 'bg-indigo-50 text-indigo-600'
      : 'text-text-muted hover:bg-gray-50 hover:text-text-primary',
  )
}

export function Sidebar() {
  const { t } = useLanguage()
  const location = useLocation()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)

  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
            attempts.length,
        )
      : 0

  const statsTooltip = `${t('sidebar.totalQuizzes', { count: quizzes.length })} · ${t('sidebar.averageScore', { score: averageScore })}`

  return (
    <aside
      className={clsx(
        'fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] flex-col border-r border-gray-100 bg-white transition-[width] duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex items-center justify-end border-b border-gray-100 p-2">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-gray-50 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
          aria-label={t('nav.toggleSidebar')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const label = t(item.labelKey)
          const link = (
            <NavLink
              key={item.labelKey}
              to={item.to}
              end={item.end}
              className={({ isActive: routerActive }) =>
                navLinkClass(
                  item.isActive
                    ? item.isActive(location.pathname)
                    : routerActive,
                  collapsed,
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.labelKey} content={label}>
                {link}
              </Tooltip>
            )
          }

          return link
        })}
      </nav>

      <div className="mt-auto border-t border-gray-100 p-2">
        {collapsed ? (
          <Tooltip content={statsTooltip}>
            <div className="flex justify-center rounded-lg bg-gray-50 p-2.5">
              <BarChart2 className="h-5 w-5 text-text-muted" aria-hidden />
            </div>
          </Tooltip>
        ) : (
          <div className="rounded-lg bg-gray-50 p-3 text-xs">
            <p className="font-medium text-text-muted">{t('sidebar.stats')}</p>
            <p className="mt-1 text-text-primary">
              {t('sidebar.totalQuizzes', { count: quizzes.length })}
            </p>
            <p className="text-text-primary">
              {t('sidebar.averageScore', { score: averageScore })}
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

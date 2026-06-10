import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'

type SidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-primary'
      : 'text-text-muted hover:bg-bg hover:text-text-primary',
  ].join(' ')

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { t } = useLanguage()

  return (
    <aside
      className={[
        'shrink-0 overflow-hidden border-r border-text-muted/20 bg-surface transition-[width] duration-200',
        isOpen ? 'w-64' : 'w-0',
      ].join(' ')}
    >
      <div className="flex h-full w-64 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-text-muted/20 px-4">
          <span className="text-sm font-semibold text-text-primary">{t('nav.menu')}</span>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1.5 text-text-muted hover:bg-bg hover:text-text-primary"
            aria-label={t('nav.closeSidebar')}
          >
            ×
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            {t('nav.history')}
          </NavLink>
          <NavLink to="/settings" className={navLinkClass}>
            {t('nav.settings')}
          </NavLink>
        </nav>
      </div>
    </aside>
  )
}

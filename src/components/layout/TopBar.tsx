import { Menu } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

type TopBarProps = {
  onMenuToggle: () => void
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { t } = useLanguage()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-text-muted/20 bg-surface px-4">
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-md p-2 text-text-muted hover:bg-bg hover:text-text-primary"
        aria-label={t('nav.toggleSidebar')}
      >
        <Menu className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-semibold text-text-primary">{t('app.name')}</h1>
    </header>
  )
}

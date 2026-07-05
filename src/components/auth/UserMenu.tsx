import clsx from 'clsx'
import { LogOut, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { topBarAvatarClass } from '../layout/topBarActionStyles'
import { useAuth } from '../../hooks/useAuth'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useLanguage } from '../../hooks/useLanguage'

export function UserMenu() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { email, signOut } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const initial = email?.charAt(0).toUpperCase() ?? '?'

  useFocusTrap(containerRef, open)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close])

  const handleMyAccount = () => {
    close()
    void navigate('/settings#data')
  }

  const handleSignOut = () => {
    close()
    void signOut()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={email ?? t('auth.myAccount')}
        onClick={() => setOpen((prev) => !prev)}
        className={topBarAvatarClass(open)}
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t('auth.myAccount')}
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <MenuItem icon={User} label={t('auth.myAccount')} onClick={handleMyAccount} />
          <MenuItem icon={LogOut} label={t('auth.signOut')} onClick={handleSignOut} />
        </div>
      ) : null}
    </div>
  )
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof User
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={clsx(
        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
        'text-text-primary motion-safe:transition-[color,background-color] motion-safe:duration-micro',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-50/80 [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
        'dark:text-gray-100 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800/90 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
        'focus-visible:bg-brand-50/80 focus-visible:outline-none dark:focus-visible:bg-gray-800/90',
        'focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-0 dark:focus-visible:ring-offset-gray-950',
        '[&_svg]:motion-safe:transition-colors [&_svg]:motion-safe:duration-micro',
        '[@media(hover:hover)_and_(pointer:fine)]:hover:[&_svg]:text-brand-600 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:[&_svg]:text-indigo-400',
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-muted dark:text-gray-400" aria-hidden />
      {label}
    </button>
  )
}

import clsx from 'clsx'
import { LogOut, User } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'

export function UserMenu() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { email, signOut } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const initial = email?.charAt(0).toUpperCase() ?? '?'

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
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
          'bg-brand-100 text-brand-700 transition-colors',
          'hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        )}
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={t('auth.myAccount')}
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
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
        'text-text-primary transition-colors hover:bg-surface-muted',
        'focus-visible:bg-surface-muted focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      {label}
    </button>
  )
}

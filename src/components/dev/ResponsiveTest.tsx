import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LG_MEDIA_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { useSidebar } from '../layout/SidebarContext'

const BREAKPOINTS = [
  { name: 'sm', min: 640 },
  { name: 'md', min: 768 },
  { name: 'lg', min: 1024 },
  { name: 'xl', min: 1280 },
] as const

function getActiveBreakpoint(width: number): string {
  let active = 'default (<sm)'
  for (const bp of BREAKPOINTS) {
    if (width >= bp.min) active = bp.name
  }
  return active
}

export function ResponsiveTest() {
  const location = useLocation()
  const isDesktop = useMediaQuery(LG_MEDIA_QUERY)
  const { isCollapsed, isMobileOpen } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  const updateSize = useCallback(() => {
    setSize({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  const breakpoint = useMemo(
    () => getActiveBreakpoint(size.width),
    [size.width],
  )

  const rules = useMemo(
    () => [
      {
        label: 'Sidebar off-canvas (below lg)',
        active: !isDesktop && !isMobileOpen,
      },
      {
        label: 'Sidebar drawer open (mobile)',
        active: !isDesktop && isMobileOpen,
      },
      {
        label: 'Sidebar expanded (lg+)',
        active: isDesktop && !isCollapsed,
      },
      {
        label: 'Sidebar collapsed (lg+)',
        active: isDesktop && isCollapsed,
      },
      {
        label: 'Quiz 2-column layout (lg+ on /quiz)',
        active: isDesktop && location.pathname === '/quiz',
      },
      {
        label: 'Main margin: narrow (collapsed sidebar)',
        active: isDesktop && isCollapsed,
      },
      {
        label: 'Main margin: wide (expanded sidebar)',
        active: isDesktop && !isCollapsed,
      },
    ],
    [isDesktop, isCollapsed, isMobileOpen, location.pathname],
  )

  return (
    <div className="fixed bottom-4 left-4 z-[100] font-sans text-sm">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg shadow-md transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        aria-label="Toggle responsive test panel"
        aria-expanded={isOpen}
      >
        📐
      </button>

      {isOpen && (
        <div
          className="mt-2 w-72 rounded-card border border-gray-200 bg-white p-4 shadow-lg"
          role="region"
          aria-label="Responsive test panel"
        >
          <p className="font-display font-semibold text-text-primary">
            Responsive Test
          </p>

          <dl className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Breakpoint</dt>
              <dd className="font-mono font-medium text-text-primary">
                {breakpoint}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-text-muted">Viewport</dt>
              <dd className="font-mono font-medium text-text-primary">
                {size.width} × {size.height}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs font-medium text-text-muted">
            Active responsive rules
          </p>
          <ul className="mt-2 space-y-1.5">
            {rules.map((rule) => (
              <li
                key={rule.label}
                className={clsx(
                  'flex items-start gap-2 text-xs',
                  rule.active ? 'text-success-600' : 'text-text-muted',
                )}
              >
                <span aria-hidden>{rule.active ? '✓' : '○'}</span>
                <span>{rule.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

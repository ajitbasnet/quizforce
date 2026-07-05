import clsx from 'clsx'
import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthModal } from '../auth/AuthModal'
import { QuickSettingsDrawer } from '../settings/QuickSettingsDrawer'
import { ShortcutHelpModal } from '../shortcuts/ShortcutHelpModal'
import { AuthProvider } from '../../hooks/useAuth'
import {
  resolveShortcutContext,
  useKeyboardShortcuts,
  useRegisterShortcutActions,
} from '../../hooks/useKeyboardShortcuts'
import { QuickSettingsProvider } from '../../hooks/useQuickSettings'
import { ShortcutHelpProvider, useShortcutHelp } from '../../hooks/useShortcutHelp'
import { useLanguage } from '../../hooks/useLanguage'
import { useScrollThreshold } from '../../hooks/useScrollThreshold'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { ResponsiveTest } from '../dev/ResponsiveTest'
import { VoiceUnsupportedNotifier } from '../voice/VoiceUnsupportedNotifier'
import { OfflineBanner } from './OfflineBanner'
import { Sidebar } from './Sidebar'
import { RouteTransition } from './RouteTransition'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <QuickSettingsProvider>
          <ShortcutHelpProvider>
            <AppShellLayout />
          </ShortcutHelpProvider>
        </QuickSettingsProvider>
      </SidebarProvider>
    </AuthProvider>
  )
}

function AppShellLayout() {
  const { t } = useLanguage()
  const location = useLocation()
  const shortcutContext = resolveShortcutContext(location.pathname)
  const { isOpen, open, close } = useShortcutHelp()
  const { isPastThreshold, sentinelRef, sentinelHeightPx } = useScrollThreshold(8)

  useRegisterShortcutActions({ 'open-help': open }, [open])
  useKeyboardShortcuts(shortcutContext)

  return (
    <div className="min-h-screen bg-bg text-text-primary dark:bg-gray-950 dark:text-gray-100">
      <div
        ref={sentinelRef}
        className="pointer-events-none w-full"
        style={{ height: sentinelHeightPx }}
        aria-hidden="true"
      />
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToMain')}
      </a>
      <TopBar isScrolled={isPastThreshold} />
      <OfflineBanner />
      <Sidebar />
      <AppShellMain>
        <RouteTransition />
      </AppShellMain>
      <AuthModal />
      <QuickSettingsDrawer />
      <ShortcutHelpModal
        isOpen={isOpen}
        onClose={close}
        context={shortcutContext}
      />
      <VoiceUnsupportedNotifier />
      {import.meta.env.DEV && <ResponsiveTest />}
    </div>
  )
}

function AppShellMain({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={clsx(
        'min-h-screen pt-16 motion-safe:transition-[margin] motion-safe:duration-standard motion-safe:ease-standard print:ml-0 print:pt-0',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64',
      )}
    >
      {children}
    </main>
  )
}

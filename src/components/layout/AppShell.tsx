import clsx from 'clsx'
import { type ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
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
import { SidebarProvider, useSidebar } from './SidebarContext'
import { ResponsiveTest } from '../dev/ResponsiveTest'
import { VoiceUnsupportedNotifier } from '../voice/VoiceUnsupportedNotifier'
import { OfflineBanner } from './OfflineBanner'
import { Sidebar } from './Sidebar'
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

  useRegisterShortcutActions({ 'open-help': open }, [open])
  useKeyboardShortcuts(shortcutContext)

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToMain')}
      </a>
      <TopBar />
      <OfflineBanner />
      <Sidebar />
      <AppShellMain>
        <Outlet />
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
        'min-h-screen pt-16 transition-[margin] duration-200 print:ml-0 print:pt-0',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64',
      )}
    >
      {children}
    </main>
  )
}

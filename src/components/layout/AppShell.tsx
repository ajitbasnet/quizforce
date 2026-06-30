import clsx from 'clsx'
import { type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthModal } from '../auth/AuthModal'
import { AuthProvider } from '../../hooks/useAuth'
import { SidebarProvider, useSidebar } from './SidebarContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-bg text-text-primary">
          <TopBar />
          <Sidebar />
          <AppShellMain>
            <Outlet />
          </AppShellMain>
          <AuthModal />
        </div>
      </SidebarProvider>
    </AuthProvider>
  )
}

function AppShellMain({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <main
      className={clsx(
        'min-h-screen pt-16 transition-[margin] duration-200 print:ml-0 print:pt-0',
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64',
      )}
    >
      {children}
    </main>
  )
}

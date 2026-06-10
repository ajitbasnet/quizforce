import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => setSidebarOpen((open) => !open)

  return (
    <div className="flex min-h-screen bg-bg text-text-primary">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex flex-1 flex-col">
        <TopBar onMenuToggle={toggleSidebar} />
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => setSidebarOpen((open) => !open)

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <TopBar />
      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PageWrapper>
            <Outlet />
          </PageWrapper>
        </div>
      </div>
    </div>
  )
}

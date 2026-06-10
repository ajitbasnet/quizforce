import clsx from 'clsx'
import { Outlet } from 'react-router-dom'
import { useSidebarStore } from '../../store/sidebarStore'
import { PageWrapper } from './PageWrapper'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <TopBar />
      <Sidebar />
      <div
        className={clsx(
          'flex min-w-0 flex-1 flex-col pt-16 transition-[padding] duration-200',
          collapsed ? 'md:pl-16' : 'md:pl-64',
        )}
      >
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </div>
    </div>
  )
}

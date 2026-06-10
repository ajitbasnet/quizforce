import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useSidebarStore } from '../../store/sidebarStore'

interface SidebarContextValue {
  isCollapsed: boolean
  toggleCollapsed: () => void
  isMobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
  toggleMobile: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isCollapsed = useSidebarStore((s) => s.collapsed)
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const openMobile = useCallback(() => setIsMobileOpen(true), [])
  const closeMobile = useCallback(() => setIsMobileOpen(false), [])
  const toggleMobile = useCallback(
    () => setIsMobileOpen((open) => !open),
    [],
  )

  const value = useMemo(
    () => ({
      isCollapsed,
      toggleCollapsed,
      isMobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    }),
    [
      isCollapsed,
      toggleCollapsed,
      isMobileOpen,
      openMobile,
      closeMobile,
      toggleMobile,
    ],
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

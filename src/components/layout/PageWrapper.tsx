import type { ReactNode } from 'react'

type PageWrapperProps = {
  children: ReactNode
}

export function PageWrapper({ children }: PageWrapperProps) {
  return <main className="flex-1 overflow-auto p-6">{children}</main>
}

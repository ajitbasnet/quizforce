import type { ReactNode } from 'react'
import { Card } from '../ui/Card'
import { SavedIndicator } from './SavedIndicator'

interface SettingsSectionCardProps {
  id: string
  title: string
  saved: boolean
  children: ReactNode
}

export function SettingsSectionCard({
  id,
  title,
  saved,
  children,
}: SettingsSectionCardProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-surface-subtle pb-2 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-text-primary dark:text-gray-100">{title}</h2>
          <SavedIndicator visible={saved} />
        </div>
        {children}
      </Card>
    </section>
  )
}

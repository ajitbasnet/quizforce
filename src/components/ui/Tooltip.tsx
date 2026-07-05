import type { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={[
          'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs',
          'bg-gray-900 text-white opacity-0 motion-safe:transition-[opacity,transform] motion-safe:duration-micro motion-safe:ease-standard',
          'motion-safe:translate-y-0.5',
          'group-hover/tooltip:opacity-100 group-hover/tooltip:motion-safe:translate-y-0',
          'group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:motion-safe:translate-y-0',
          'dark:bg-gray-700 dark:ring-1 dark:ring-gray-600',
        ].join(' ')}
      >
        {content}
      </span>
    </div>
  )
}

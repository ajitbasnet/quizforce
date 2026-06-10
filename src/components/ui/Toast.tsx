import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  title: string
  description?: string
  variant: ToastVariant
  onDismiss: () => void
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon: LucideIcon
    container: string
    iconClass: string
    role: 'status' | 'alert'
  }
> = {
  success: {
    icon: CheckCircle2,
    container: 'border-green-200 bg-green-50',
    iconClass: 'text-green-600',
    role: 'status',
  },
  error: {
    icon: XCircle,
    container: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
    role: 'alert',
  },
  info: {
    icon: Info,
    container: 'border-indigo-200 bg-indigo-50',
    iconClass: 'text-indigo-600',
    role: 'status',
  },
  warning: {
    icon: AlertCircle,
    container: 'border-amber-200 bg-amber-50',
    iconClass: 'text-amber-600',
    role: 'status',
  },
}

export const toastMotionProps = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 80 },
  transition: { duration: 0.2 },
} as const

export function Toast({ title, description, variant, onDismiss }: ToastProps) {
  const { icon: Icon, container, iconClass, role } = VARIANT_CONFIG[variant]

  return (
    <div
      role={role}
      className={clsx(
        'flex w-80 max-w-[calc(100vw-2rem)] gap-3 rounded-xl border p-4 shadow-lg',
        container,
      )}
    >
      <Icon className={clsx('h-5 w-5 shrink-0', iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function AnimatedToast(props: ToastProps) {
  return (
    <motion.div className="pointer-events-auto" {...toastMotionProps}>
      <Toast {...props} />
    </motion.div>
  )
}

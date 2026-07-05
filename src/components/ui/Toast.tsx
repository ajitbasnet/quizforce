import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  useMotionTransition,
  useReducedMotion,
} from '../../hooks/useReducedMotion'
import { MOTION } from '../../utils/motionTokens'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

const MAX_TOASTS = 5
const DEFAULT_DURATION = 4000

interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

interface ToastOptions {
  description?: string
  duration?: number
}

interface ToastContextValue {
  toast: {
    success: (title: string, options?: ToastOptions) => void
    error: (title: string, options?: ToastOptions) => void
    info: (title: string, options?: ToastOptions) => void
    warning: (title: string, options?: ToastOptions) => void
    dismiss: (id: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export interface ToastProps {
  title: string
  description?: string
  variant: ToastVariant
  duration: number
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
    container: 'border-success-100 bg-success-50 dark:border-success-800 dark:bg-success-950/60',
    iconClass: 'text-success-600 dark:text-success-400',
    role: 'status',
  },
  error: {
    icon: XCircle,
    container: 'border-danger-100 bg-danger-50 dark:border-danger-800 dark:bg-danger-950/60',
    iconClass: 'text-danger-600 dark:text-danger-400',
    role: 'alert',
  },
  info: {
    icon: Info,
    container: 'border-brand-100 bg-brand-50 dark:border-indigo-800 dark:bg-indigo-950/60',
    iconClass: 'text-brand-600 dark:text-indigo-400',
    role: 'status',
  },
  warning: {
    icon: AlertCircle,
    container: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60',
    iconClass: 'text-amber-600 dark:text-amber-400',
    role: 'status',
  },
}

const toastMotionInitial = { opacity: 0, x: 80 }
const toastMotionAnimate = { opacity: 1, x: 0 }
const toastMotionExit = { opacity: 0, x: 96 }

function ToastMotionItem({
  children,
}: {
  children: ReactNode
}) {
  const enterTransition = useMotionTransition(
    MOTION.duration.standard,
    MOTION.easeStandard,
  )
  const exitTransition = useMotionTransition(
    MOTION.duration.exit,
    MOTION.easeStandard,
  )

  return (
    <motion.div
      className="pointer-events-auto"
      initial={toastMotionInitial}
      animate={{ ...toastMotionAnimate, transition: enterTransition }}
      exit={{ ...toastMotionExit, transition: exitTransition }}
    >
      {children}
    </motion.div>
  )
}

export function Toast({
  title,
  description,
  variant,
  duration,
  onDismiss,
}: ToastProps) {
  const { icon: Icon, container, iconClass, role } = VARIANT_CONFIG[variant]
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      role={role}
      className={clsx(
        'relative flex w-80 max-w-[calc(100vw-2rem)] gap-3 overflow-hidden rounded-xl border p-4 shadow-lg',
        container,
      )}
    >
      <Icon className={clsx('h-5 w-5 shrink-0', iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text-primary dark:text-gray-100">{title}</p>
        {description && (
          <p className="mt-0.5 text-sm text-text-muted dark:text-gray-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-current opacity-25"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timeoutMapRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  )

  const dismiss = useCallback((id: string) => {
    const timeout = timeoutMapRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutMapRef.current.delete(id)
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (
      variant: ToastVariant,
      title: string,
      options?: ToastOptions,
    ) => {
      const id = crypto.randomUUID()
      const duration = options?.duration ?? DEFAULT_DURATION

      const item: ToastItem = {
        id,
        title,
        description: options?.description,
        variant,
        duration,
      }

      setToasts((current) => [item, ...current].slice(0, MAX_TOASTS))

      const timeout = setTimeout(() => dismiss(id), duration)
      timeoutMapRef.current.set(id, timeout)
    },
    [dismiss],
  )

  useEffect(() => {
    const timeouts = timeoutMapRef.current
    return () => {
      timeouts.forEach(clearTimeout)
      timeouts.clear()
    }
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: {
        success: (title, options) => addToast('success', title, options),
        error: (title, options) => addToast('error', title, options),
        info: (title, options) => addToast('info', title, options),
        warning: (title, options) => addToast('warning', title, options),
        dismiss,
      },
    }),
    [addToast, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col-reverse gap-3"
        >
          <AnimatePresence>
            {toasts.map((item) => (
              <ToastMotionItem key={item.id}>
                <Toast
                  title={item.title}
                  description={item.description}
                  variant={item.variant}
                  duration={item.duration}
                  onDismiss={() => dismiss(item.id)}
                />
              </ToastMotionItem>
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

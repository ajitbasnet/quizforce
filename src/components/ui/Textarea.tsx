import clsx from 'clsx'
import { motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useRef,
  type InputEvent,
  type TextareaHTMLAttributes,
} from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useShakeOnError } from '../../hooks/useShakeOnError'
import { useMotionTransition } from '../../hooks/useReducedMotion'
import { MOTION } from '../../utils/motionTokens'
import {
  controlBaseClass,
  controlErrorClass,
  fieldErrorClass,
  fieldHelperClass,
  fieldId,
  fieldLabelClass,
} from './formFieldUtils'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  register?: UseFormRegisterReturn
  error?: FieldError
  label?: string
  helperText?: string
  rows?: number
  autoResize?: boolean
  minHeightPx?: number
  maxHeightPx?: number
}

interface ResizeOptions {
  minHeightPx?: number
  maxHeightPx?: number
}

function resizeTextarea(el: HTMLTextAreaElement, options: ResizeOptions = {}) {
  const { minHeightPx, maxHeightPx } = options
  el.style.height = 'auto'
  const scrollHeight = el.scrollHeight
  const min = minHeightPx ?? scrollHeight
  const max = maxHeightPx ?? scrollHeight
  const height = Math.min(Math.max(scrollHeight, min), Math.max(min, max))
  el.style.height = `${height}px`
  el.style.overflowY =
    maxHeightPx !== undefined && scrollHeight > maxHeightPx ? 'auto' : 'hidden'
}

export function Textarea({
  register,
  error,
  label,
  helperText,
  rows = 4,
  autoResize = false,
  minHeightPx,
  maxHeightPx,
  id,
  className,
  onInput,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const resizeOptions: ResizeOptions = { minHeightPx, maxHeightPx }
  const inputId = fieldId(label, id)
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined
  const errorId = inputId && error?.message ? `${inputId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined
  const shouldShake = useShakeOnError(error)
  const shakeTransition = useMotionTransition(MOTION.fast)

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      register?.ref(el)
      if (el && autoResize) {
        resizeTextarea(el, resizeOptions)
      }
    },
    [register, autoResize, minHeightPx, maxHeightPx],
  )

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      resizeTextarea(textareaRef.current, resizeOptions)
    }
  }, [autoResize, minHeightPx, maxHeightPx, props.value, props.defaultValue])

  const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      resizeTextarea(e.currentTarget, resizeOptions)
    }
    onInput?.(e)
  }

  return (
    <div className="w-full">
      {label && inputId && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
        </label>
      )}
      {label && !inputId && <span className={fieldLabelClass}>{label}</span>}
      <motion.div
        animate={shouldShake ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={shakeTransition}
      >
        <textarea
          {...register}
          {...props}
          ref={setRef}
          id={inputId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onInput={handleInput}
          className={clsx(
            controlBaseClass,
            'px-3 py-2',
            autoResize && 'resize-none overflow-hidden',
            error && controlErrorClass,
            className,
          )}
        />
      </motion.div>
      {error?.message && (
        <p id={errorId} className={fieldErrorClass} role="alert">
          {error.message}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className={fieldHelperClass}>
          {helperText}
        </p>
      )}
    </div>
  )
}

import clsx from 'clsx'
import { motion } from 'framer-motion'
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
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

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  register?: UseFormRegisterReturn
  error?: FieldError
  label?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    register,
    error,
    label,
    helperText,
    leftIcon,
    rightIcon,
    type = 'text',
    id,
    className,
    ...props
  },
  ref,
) {
  const inputId = fieldId(label, id)
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined
  const errorId = inputId && error?.message ? `${inputId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined
  const hasIcons = !!(leftIcon || rightIcon)
  const shouldShake = useShakeOnError(error)
  const shakeTransition = useMotionTransition(MOTION.fast)

  return (
    <div className="w-full">
      {label && inputId && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
        </label>
      )}
      {label && !inputId && <span className={fieldLabelClass}>{label}</span>}
      <motion.div
        className={clsx(hasIcons && 'relative')}
        animate={shouldShake ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={shakeTransition}
      >
        {leftIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-muted dark:text-gray-400"
            aria-hidden
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          {...register}
          {...props}
          id={inputId}
          type={type}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={clsx(
            controlBaseClass,
            'px-3 py-2',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && controlErrorClass,
            className,
          )}
        />
        {rightIcon && (
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-text-muted dark:text-gray-400"
            aria-hidden
          >
            {rightIcon}
          </span>
        )}
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
})

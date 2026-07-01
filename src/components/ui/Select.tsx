import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { ReactNode, SelectHTMLAttributes } from 'react'
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

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  register?: UseFormRegisterReturn
  error?: FieldError
  label?: string
  helperText?: string
  children: ReactNode
}

export function Select({
  register,
  error,
  label,
  helperText,
  children,
  id,
  className,
  ...props
}: SelectProps) {
  const selectId = fieldId(label, id)
  const helperId = selectId && helperText ? `${selectId}-helper` : undefined
  const errorId = selectId && error?.message ? `${selectId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined
  const shouldShake = useShakeOnError(error)
  const shakeTransition = useMotionTransition(MOTION.fast)

  return (
    <div className="w-full">
      {label && selectId && (
        <label htmlFor={selectId} className={fieldLabelClass}>
          {label}
        </label>
      )}
      {label && !selectId && <span className={fieldLabelClass}>{label}</span>}
      <motion.div
        animate={shouldShake ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
        transition={shakeTransition}
      >
        <select
          {...register}
          {...props}
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={clsx(
            controlBaseClass,
            'px-3 py-2 pr-8',
            error && controlErrorClass,
            className,
          )}
        >
          {children}
        </select>
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

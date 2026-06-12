import clsx from 'clsx'
import type { FieldError } from 'react-hook-form'
import {
  controlErrorClass,
  fieldErrorClass,
  fieldHelperClass,
  fieldId,
  fieldLabelClass,
} from './formFieldUtils'

interface RangeSliderProps {
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  label?: string
  error?: FieldError
  helperText?: string
  valueFormatter?: (value: number) => string
  id?: string
  className?: string
  disabled?: boolean
}

export function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  error,
  helperText,
  valueFormatter,
  id,
  className,
  disabled,
}: RangeSliderProps) {
  const inputId = fieldId(label, id)
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined
  const errorId = inputId && error?.message ? `${inputId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined

  return (
    <div className={clsx('w-full', className)}>
      {(label || valueFormatter) && (
        <div className="mb-1 flex items-center justify-between gap-2">
          {label && inputId && (
            <label htmlFor={inputId} className={fieldLabelClass}>
              {label}
            </label>
          )}
          {label && !inputId && (
            <span className={fieldLabelClass}>{label}</span>
          )}
          {valueFormatter && (
            <span className="text-sm text-text-muted">{valueFormatter(value)}</span>
          )}
        </div>
      )}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'h-2 w-full cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2',
          error && controlErrorClass,
        )}
      />
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

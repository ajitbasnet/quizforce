import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
import { useShakeOnError } from '../../hooks/useShakeOnError'
import { Button } from './Button'
import {
  controlBaseClass,
  controlErrorClass,
  fieldErrorClass,
  fieldHelperClass,
  fieldId,
  fieldLabelClass,
} from './formFieldUtils'

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'name'> {
  register?: UseFormRegisterReturn
  error?: FieldError
  label?: string
  helperText?: string
  step?: number
}

export function NumberInput({
  register,
  error,
  label,
  helperText,
  step = 1,
  min,
  max,
  id,
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  onInput,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [internalValue, setInternalValue] = useState<number | undefined>(() => {
    if (value !== undefined) return Number(value)
    if (defaultValue !== undefined) return Number(defaultValue)
    return undefined
  })

  const inputId = fieldId(label, id)
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined
  const errorId = inputId && error?.message ? `${inputId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined
  const shouldShake = useShakeOnError(error)

  const setRef = (element: HTMLInputElement | null) => {
    inputRef.current = element
    register?.ref(element)
    if (element && internalValue === undefined && element.value !== '') {
      setInternalValue(element.valueAsNumber)
    }
  }

  const syncValueFromElement = () => {
    const element = inputRef.current
    if (!element) return
    setInternalValue(Number.isNaN(element.valueAsNumber) ? undefined : element.valueAsNumber)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    register?.onChange?.(event)
    onChange?.(event)
    setInternalValue(
      Number.isNaN(event.target.valueAsNumber)
        ? undefined
        : event.target.valueAsNumber,
    )
  }

  const handleInput: NonNullable<InputHTMLAttributes<HTMLInputElement>['onInput']> = (
    event,
  ) => {
    onInput?.(event)
    syncValueFromElement()
  }

  const handleStep = (direction: 'up' | 'down') => {
    const element = inputRef.current
    if (!element || disabled) return

    if (direction === 'up') {
      element.stepUp()
    } else {
      element.stepDown()
    }

    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    syncValueFromElement()
  }

  const numericValue =
    value !== undefined ? Number(value) : internalValue

  const atMin =
    min !== undefined &&
    numericValue !== undefined &&
    !Number.isNaN(numericValue) &&
    numericValue <= Number(min)

  const atMax =
    max !== undefined &&
    numericValue !== undefined &&
    !Number.isNaN(numericValue) &&
    numericValue >= Number(max)

  return (
    <div className="w-full">
      {label && inputId && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
        </label>
      )}
      {label && !inputId && <span className={fieldLabelClass}>{label}</span>}
      <div className="flex items-stretch gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || atMin}
          onClick={() => handleStep('down')}
          aria-label="Decrease value"
          className="shrink-0 px-2"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </Button>
        <motion.div
          className="min-w-0 flex-1"
          animate={shouldShake ? { x: [0, -4, 4, -2, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <input
            {...register}
            {...props}
            ref={setRef}
            id={inputId}
            type="number"
            step={step}
            min={min}
            max={max}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleChange}
            onInput={handleInput}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={clsx(
              controlBaseClass,
              'w-full px-3 py-2 text-center',
              error && controlErrorClass,
              className,
            )}
          />
        </motion.div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || atMax}
          onClick={() => handleStep('up')}
          aria-label="Increase value"
          className="shrink-0 px-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </div>
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

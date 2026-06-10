import clsx from 'clsx'
import {
  useCallback,
  useEffect,
  useRef,
  type InputEvent,
  type TextareaHTMLAttributes,
} from 'react'
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form'
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
}

function resizeTextarea(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function Textarea({
  register,
  error,
  label,
  helperText,
  rows = 4,
  autoResize = false,
  id,
  className,
  onInput,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const inputId = fieldId(label, id)
  const helperId = inputId && helperText ? `${inputId}-helper` : undefined
  const errorId = inputId && error?.message ? `${inputId}-error` : undefined
  const describedBy = [errorId, !error && helperId].filter(Boolean).join(' ') || undefined

  const setRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      register?.ref(el)
      if (el && autoResize) {
        resizeTextarea(el)
      }
    },
    [register, autoResize],
  )

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      resizeTextarea(textareaRef.current)
    }
  }, [autoResize, props.value, props.defaultValue])

  const handleInput = (e: InputEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      resizeTextarea(e.currentTarget)
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

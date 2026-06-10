import { type FormEvent, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import {
  TEXT_INPUT_MAX_CHARS,
  TEXT_INPUT_WARN_CHARS,
  textInputSchema,
} from '../../utils/validators'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

interface TextInputPanelProps {
  onSubmit?: (content: string) => void
  isLoading?: boolean
  hideSubmit?: boolean
  onContentChange?: (content: string) => void
}

export function TextInputPanel({
  onSubmit,
  isLoading = false,
  hideSubmit = false,
  onContentChange,
}: TextInputPanelProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState('')
  const [validationError, setValidationError] = useState<string | undefined>()

  const handleChange = (value: string) => {
    const next = value.slice(0, TEXT_INPUT_MAX_CHARS)
    setContent(next)
    setValidationError(undefined)
    onContentChange?.(next)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = textInputSchema.safeParse(content)
    if (!result.success) {
      const issue = result.error.issues[0]
      if (issue.code === 'too_small') {
        setValidationError(t('input.textMinLengthError'))
      } else {
        setValidationError(issue.message)
      }
      return
    }
    setValidationError(undefined)
    onSubmit?.(result.data)
  }

  const showWarning = content.length > TEXT_INPUT_WARN_CHARS

  const Wrapper = hideSubmit ? 'div' : 'form'
  const wrapperProps = hideSubmit
    ? { className: 'flex flex-col gap-4' }
    : { onSubmit: handleSubmit, className: 'flex flex-col gap-4' }

  return (
    <Wrapper {...wrapperProps}>
      <Textarea
        label={t('input.textLabel')}
        placeholder={t('input.textPlaceholder')}
        autoResize
        minHeightPx={200}
        maxHeightPx={500}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        maxLength={TEXT_INPUT_MAX_CHARS}
        error={validationError ? { message: validationError, type: 'manual' } : undefined}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          {t('input.textCharCount', {
            current: content.length.toLocaleString(),
            max: TEXT_INPUT_MAX_CHARS.toLocaleString(),
          })}
        </p>
        {showWarning && (
          <Badge variant="warning" size="sm">
            {t('input.textLargeContentWarning')}
          </Badge>
        )}
      </div>

      {!hideSubmit && (
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={content.trim().length === 0}
          isLoading={isLoading}
        >
          {t('input.generateButton')}
        </Button>
      )}
    </Wrapper>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  type FormEvent,
} from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useLanguage } from '../../hooks/useLanguage'
import {
  TEXT_INPUT_MAX_CHARS,
  TEXT_INPUT_WARN_CHARS,
  textInputSchema,
  translateValidationMessage,
} from '../../utils/validators'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

const formSchema = z.object({ content: textInputSchema })
type FormValues = z.infer<typeof formSchema>

export interface TextInputPanelHandle {
  validate: () => Promise<{ ok: true; content: string } | { ok: false }>
}

interface TextInputPanelProps {
  onSubmit?: (content: string) => void
  isLoading?: boolean
  hideSubmit?: boolean
  onContentChange?: (content: string) => void
}

export const TextInputPanel = forwardRef<TextInputPanelHandle, TextInputPanelProps>(
  function TextInputPanel(
    { onSubmit, isLoading = false, hideSubmit = false, onContentChange },
    ref,
  ) {
    const { t } = useLanguage()
    const {
      register,
      handleSubmit,
      watch,
      trigger,
      getValues,
      formState: { errors },
    } = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: { content: '' },
      mode: 'onSubmit',
    })

    const content = watch('content')

    useEffect(() => {
      onContentChange?.(content)
    }, [content, onContentChange])

    useImperativeHandle(
      ref,
      () => ({
        validate: async () => {
          const ok = await trigger()
          if (!ok) return { ok: false }
          return { ok: true, content: getValues('content') }
        },
      }),
      [trigger, getValues],
    )

    const onValidSubmit = (data: FormValues) => {
      onSubmit?.(data.content)
    }

    const handleFormSubmit = (e: FormEvent) => {
      void handleSubmit(onValidSubmit)(e)
    }

    const contentError = errors.content?.message
      ? {
          message: translateValidationMessage(errors.content.message, t) ?? '',
          type: 'manual' as const,
        }
      : undefined

    const showWarning = content.length > TEXT_INPUT_WARN_CHARS

    const Wrapper = hideSubmit ? 'div' : 'form'
    const wrapperProps = hideSubmit
      ? { className: 'flex flex-col gap-4' }
      : { onSubmit: handleFormSubmit, className: 'flex flex-col gap-4' }

    return (
      <Wrapper {...wrapperProps}>
        <Textarea
          label={t('input.textLabel')}
          placeholder={t('input.textPlaceholder')}
          autoResize
          minHeightPx={200}
          maxHeightPx={500}
          maxLength={TEXT_INPUT_MAX_CHARS}
          register={register('content')}
          error={contentError}
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
  },
)

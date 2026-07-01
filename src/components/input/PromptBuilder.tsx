import { zodResolver } from '@hookform/resolvers/zod'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  type FormEvent,
} from 'react'
import { useForm } from 'react-hook-form'
import { useLanguage } from '../../hooks/useLanguage'
import {
  assemblePrompt,
  type TargetAudience,
} from '../../utils/promptBuilder'
import {
  promptSchema,
  translateValidationMessage,
  type PromptFormValues,
} from '../../utils/validators'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

export interface PromptBuilderHandle {
  validate: () => Promise<{ ok: true; content: string } | { ok: false }>
}

interface PromptBuilderProps {
  onSubmit?: (prompt: string) => void
  isLoading?: boolean
  hideSubmit?: boolean
  onPromptChange?: (data: { topic: string; prompt: string }) => void
  initialTopic?: string
}

const AUDIENCE_OPTIONS: TargetAudience[] = [
  'elementary',
  'high_school',
  'college',
  'professional',
  'custom',
]

const AUDIENCE_LABEL_KEYS: Record<TargetAudience, string> = {
  elementary: 'input.audienceElementary',
  high_school: 'input.audienceHighSchool',
  college: 'input.audienceCollege',
  professional: 'input.audienceProfessional',
  custom: 'input.audienceCustom',
}

const defaultValues: PromptFormValues = {
  topic: '',
  subtopics: '',
  audience: 'high_school',
  customAudience: '',
  specialInstructions: '',
}

function toTranslatedError(
  message: string | undefined,
  t: (key: string) => string,
) {
  if (!message) return undefined
  return {
    message: translateValidationMessage(message, t) ?? message,
    type: 'manual' as const,
  }
}

export const PromptBuilder = forwardRef<PromptBuilderHandle, PromptBuilderProps>(
  function PromptBuilder(
    {
      onSubmit,
      isLoading = false,
      hideSubmit = false,
      onPromptChange,
      initialTopic,
    },
    ref,
  ) {
    const { t } = useLanguage()
    const {
      register,
      handleSubmit,
      watch,
      trigger,
      getValues,
      reset,
      formState: { errors },
    } = useForm<PromptFormValues>({
      resolver: zodResolver(promptSchema),
      defaultValues,
      mode: 'onSubmit',
    })

    useEffect(() => {
      if (initialTopic) {
        reset({ ...defaultValues, topic: initialTopic })
      }
    }, [initialTopic, reset])

    const topic = watch('topic')
    const subtopics = watch('subtopics')
    const audience = watch('audience')
    const customAudience = watch('customAudience')
    const specialInstructions = watch('specialInstructions')

    const resolvedAudienceLabel =
      audience === 'custom'
        ? customAudience.trim() || t('input.audienceCustom')
        : t(AUDIENCE_LABEL_KEYS[audience])

    const previewText = useMemo(() => {
      if (!topic.trim()) {
        return t('input.previewPromptEmpty')
      }
      return assemblePrompt(
        { topic, subtopics, audience, customAudience, specialInstructions },
        { audience: resolvedAudienceLabel },
      )
    }, [
      topic,
      subtopics,
      audience,
      customAudience,
      specialInstructions,
      resolvedAudienceLabel,
      t,
    ])

    useEffect(() => {
      onPromptChange?.({
        topic,
        prompt: topic.trim() ? previewText : '',
      })
    }, [topic, previewText, onPromptChange])

    useImperativeHandle(
      ref,
      () => ({
        validate: async () => {
          const ok = await trigger()
          if (!ok) return { ok: false }
          const values = getValues()
          const label =
            values.audience === 'custom'
              ? values.customAudience.trim() || t('input.audienceCustom')
              : t(AUDIENCE_LABEL_KEYS[values.audience])
          return {
            ok: true,
            content: assemblePrompt(values, { audience: label }),
          }
        },
      }),
      [trigger, getValues, t],
    )

    const onValidSubmit = (data: PromptFormValues) => {
      onSubmit?.(
        assemblePrompt(data, {
          audience:
            data.audience === 'custom'
              ? data.customAudience.trim() || t('input.audienceCustom')
              : t(AUDIENCE_LABEL_KEYS[data.audience]),
        }),
      )
    }

    const handleFormSubmit = (e: FormEvent) => {
      void handleSubmit(onValidSubmit)(e)
    }

    const Wrapper = hideSubmit ? 'div' : 'form'
    const wrapperProps = hideSubmit
      ? { className: 'flex flex-col gap-4' }
      : { onSubmit: handleFormSubmit, className: 'flex flex-col gap-4' }

    return (
      <Wrapper {...wrapperProps}>
        <Input
          label={t('input.topicLabel')}
          placeholder={t('input.topicPlaceholder')}
          required
          register={register('topic')}
          error={toTranslatedError(errors.topic?.message, t)}
        />

        <Input
          label={t('input.subtopicsLabel')}
          placeholder={t('input.subtopicsPlaceholder')}
          register={register('subtopics')}
          error={toTranslatedError(errors.subtopics?.message, t)}
        />

        <Select
          label={t('input.audienceLabel')}
          register={register('audience')}
          error={toTranslatedError(errors.audience?.message, t)}
        >
          {AUDIENCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {t(AUDIENCE_LABEL_KEYS[option])}
            </option>
          ))}
        </Select>

        {audience === 'custom' && (
          <Input
            label={t('input.customAudienceLabel')}
            placeholder={t('input.customAudiencePlaceholder')}
            register={register('customAudience')}
            error={toTranslatedError(errors.customAudience?.message, t)}
          />
        )}

        <Textarea
          label={t('input.specialInstructionsLabel')}
          placeholder={t('input.specialInstructionsPlaceholder')}
          rows={3}
          register={register('specialInstructions')}
          error={toTranslatedError(errors.specialInstructions?.message, t)}
        />

        <div className="mt-2">
          <h3 className="mb-2 text-sm font-medium text-text-primary dark:text-gray-100">
            {t('input.previewPromptLabel')}
          </h3>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm text-text-primary dark:bg-gray-800 dark:text-gray-100">
            {previewText}
          </pre>
        </div>

        {!hideSubmit && (
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!topic.trim()}
            isLoading={isLoading}
          >
            {t('input.generateButton')}
          </Button>
        )}
      </Wrapper>
    )
  },
)

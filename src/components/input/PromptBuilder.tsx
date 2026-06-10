import { type FormEvent, useMemo, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import {
  assemblePrompt,
  type PromptBuilderFields,
  type TargetAudience,
} from '../../utils/promptBuilder'
import { promptTopicSchema } from '../../utils/validators'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'

interface PromptBuilderProps {
  onSubmit: (prompt: string) => void
  isLoading?: boolean
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

export function PromptBuilder({ onSubmit, isLoading = false }: PromptBuilderProps) {
  const { t } = useLanguage()
  const [topic, setTopic] = useState('')
  const [subtopics, setSubtopics] = useState('')
  const [audience, setAudience] = useState<TargetAudience>('high_school')
  const [customAudience, setCustomAudience] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [topicError, setTopicError] = useState<string | undefined>()

  const resolvedAudienceLabel =
    audience === 'custom'
      ? customAudience.trim() || t('input.audienceCustom')
      : t(AUDIENCE_LABEL_KEYS[audience])

  const fields: PromptBuilderFields = {
    topic,
    subtopics,
    audience,
    customAudience,
    specialInstructions,
  }

  const previewText = useMemo(() => {
    if (!topic.trim()) {
      return t('input.previewPromptEmpty')
    }
    return assemblePrompt(fields, { audience: resolvedAudienceLabel })
  }, [
    topic,
    subtopics,
    audience,
    customAudience,
    specialInstructions,
    resolvedAudienceLabel,
    t,
  ])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = promptTopicSchema.safeParse(topic)
    if (!result.success) {
      const issue = result.error.issues[0]
      if (issue.code === 'too_small') {
        setTopicError(t('input.topicRequiredError'))
      } else {
        setTopicError(issue.message)
      }
      return
    }
    setTopicError(undefined)
    onSubmit(
      assemblePrompt(
        { ...fields, topic: result.data },
        { audience: resolvedAudienceLabel },
      ),
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t('input.topicLabel')}
        placeholder={t('input.topicPlaceholder')}
        value={topic}
        onChange={(e) => {
          setTopic(e.target.value)
          setTopicError(undefined)
        }}
        required
        error={topicError ? { message: topicError, type: 'manual' } : undefined}
      />

      <Input
        label={t('input.subtopicsLabel')}
        placeholder={t('input.subtopicsPlaceholder')}
        value={subtopics}
        onChange={(e) => setSubtopics(e.target.value)}
      />

      <Select
        label={t('input.audienceLabel')}
        value={audience}
        onChange={(e) => setAudience(e.target.value as TargetAudience)}
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
          value={customAudience}
          onChange={(e) => setCustomAudience(e.target.value)}
        />
      )}

      <Textarea
        label={t('input.specialInstructionsLabel')}
        placeholder={t('input.specialInstructionsPlaceholder')}
        rows={3}
        value={specialInstructions}
        onChange={(e) => setSpecialInstructions(e.target.value)}
      />

      <div className="mt-2">
        <h3 className="mb-2 text-sm font-medium text-text-primary">
          {t('input.previewPromptLabel')}
        </h3>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-sm text-text-primary">
          {previewText}
        </pre>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={!topic.trim()}
        isLoading={isLoading}
      >
        {t('input.generateButton')}
      </Button>
    </form>
  )
}

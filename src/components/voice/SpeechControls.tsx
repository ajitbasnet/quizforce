import clsx from 'clsx'
import { ChevronRight, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useSpeechVoices } from '../../hooks/useSpeechVoices'
import { useVoice } from '../../hooks/useVoice'
import { useSettingsStore } from '../../store/settingsStore'
import { useVoiceStore } from '../../store/voiceStore'
import type { QuizQuestion, SupportedLanguage } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { RangeSlider } from '../ui/RangeSlider'
import { Select } from '../ui/Select'
import { Tooltip } from '../ui/Tooltip'

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export interface SpeechControlsProps {
  question: QuizQuestion
  language: SupportedLanguage
}

interface SpeechControlsPanelProps {
  question: QuizQuestion
  language: SupportedLanguage
  disabled?: boolean
  className?: string
}

function formatVoiceValue(value: number): string {
  return `${value.toFixed(1)}x`
}

export function SpeechControlsPanel({
  question,
  language,
  disabled = false,
  className,
}: SpeechControlsPanelProps) {
  const { t } = useLanguage()
  const voiceRate = useSettingsStore((s) => s.settings.voiceRate)
  const voicePitch = useSettingsStore((s) => s.settings.voicePitch)
  const voiceURI = useSettingsStore((s) => s.settings.voiceURI)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const lastSpokenText = useVoiceStore((s) => s.lastSpokenText)
  const { speak, speakSequence, speakAgain, isSupported } = useVoice()
  const { voices } = useSpeechVoices(language)

  const controlsDisabled = disabled || !isSupported

  const handleReadQuestion = () => {
    speak(question.questionText, language)
  }

  const handleReadOptions = () => {
    const texts = question.options.map(
      (option, index) =>
        `${OPTION_LETTERS[index] ?? String(index + 1)}. ${option.text}`,
    )
    speakSequence(texts, language)
  }

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          leftIcon={<Play className="h-4 w-4" aria-hidden />}
          disabled={controlsDisabled}
          onClick={handleReadQuestion}
        >
          {t('voice.readQuestion')}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          disabled={controlsDisabled}
          onClick={handleReadOptions}
        >
          {t('voice.readOptions')}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
          disabled={controlsDisabled || !lastSpokenText.trim()}
          onClick={speakAgain}
        >
          {t('voice.readAgain')}
        </Button>
      </div>

      <RangeSlider
        label={t('voice.rate')}
        min={0.5}
        max={2}
        step={0.1}
        value={voiceRate}
        valueFormatter={formatVoiceValue}
        disabled={controlsDisabled}
        onChange={(value) => updateSettings({ voiceRate: value })}
      />

      <RangeSlider
        label={t('voice.pitch')}
        min={0.5}
        max={2}
        step={0.1}
        value={voicePitch}
        valueFormatter={formatVoiceValue}
        disabled={controlsDisabled}
        onChange={(value) => updateSettings({ voicePitch: value })}
      />

      {voices.length > 1 && (
        <Select
          label={t('voice.selectVoice')}
          value={voiceURI ?? ''}
          disabled={controlsDisabled}
          onChange={(event) =>
            updateSettings({
              voiceURI: event.target.value || null,
            })
          }
        >
          {voices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name}
            </option>
          ))}
        </Select>
      )}
    </div>
  )
}

export function SpeechControls({ question, language }: SpeechControlsProps) {
  const { t } = useLanguage()
  const { isSupported } = useVoice()
  const [expanded, setExpanded] = useState(true)

  const panel = (
    <Card className="w-full">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="text-sm font-medium text-text-primary">
          {t('voice.controlsTitle')}
        </span>
        <ChevronRight
          className={clsx(
            'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
            expanded && 'rotate-90',
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="mt-4">
          <SpeechControlsPanel
            question={question}
            language={language}
            disabled={!isSupported}
          />
        </div>
      )}
    </Card>
  )

  if (!isSupported) {
    return (
      <Tooltip content={t('voice.notSupported')}>
        <div className="w-full">{panel}</div>
      </Tooltip>
    )
  }

  return panel
}

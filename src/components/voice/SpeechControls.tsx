import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Play, RotateCcw, Volume2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

function SpeechControlsCollapsible({
  question,
  language,
}: SpeechControlsProps) {
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
        <span className="text-sm font-medium text-text-primary dark:text-gray-100">
          {t('voice.controlsTitle')}
        </span>
        <ChevronRight
          className={clsx(
            'h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 dark:text-gray-400',
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

function SpeechControlsMobileDrawer({
  question,
  language,
}: SpeechControlsProps) {
  const { t } = useLanguage()
  const { isSupported } = useVoice()
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const trigger = (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="fixed bottom-20 right-4 z-40 min-h-11 shadow-md lg:hidden"
      leftIcon={<Volume2 className="h-4 w-4" aria-hidden />}
      onClick={() => setDrawerOpen(true)}
    >
      {t('voice.openControls')}
    </Button>
  )

  const drawer = createPortal(
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close"
            onClick={() => setDrawerOpen(false)}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[60vh] flex-col rounded-t-2xl bg-white shadow-xl dark:bg-gray-900 lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={t('voice.controlsTitle')}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 p-4 pb-2">
              <h2 className="text-sm font-medium text-text-primary dark:text-gray-100">
                {t('voice.controlsTitle')}
              </h2>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-text-muted hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-0">
              <SpeechControlsPanel
                question={question}
                language={language}
                disabled={!isSupported}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )

  if (!isSupported) {
    return (
      <>
        <Tooltip content={t('voice.notSupported')}>
          <span className="lg:hidden">{trigger}</span>
        </Tooltip>
        {drawer}
      </>
    )
  }

  return (
    <>
      {trigger}
      {drawer}
    </>
  )
}

export function SpeechControls({ question, language }: SpeechControlsProps) {
  return (
    <>
      <aside className="hidden lg:block lg:sticky lg:top-24">
        <SpeechControlsCollapsible question={question} language={language} />
      </aside>
      <SpeechControlsMobileDrawer question={question} language={language} />
    </>
  )
}

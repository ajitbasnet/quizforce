import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, Square } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useVoice } from '../../hooks/useVoice'
import { useSettingsStore } from '../../store/settingsStore'
import { topBarIconButtonClass } from '../layout/topBarActionStyles'

function truncateText(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function VoicePlayer() {
  const { t } = useLanguage()
  const voiceEnabled = useSettingsStore((s) => s.settings.voiceEnabled)
  const {
    isSpeaking,
    isPaused,
    currentText,
    isSupported,
    stop,
    pause,
    resume,
  } = useVoice()
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    if (isSpeaking || isPaused) {
      setShowPlayer(true)
      return
    }

    if (showPlayer) {
      const timer = window.setTimeout(() => setShowPlayer(false), 500)
      return () => window.clearTimeout(timer)
    }
  }, [isSpeaking, isPaused, showPlayer])

  if (!voiceEnabled || !isSupported) {
    return null
  }

  const isAnimating = isSpeaking && !isPaused

  return (
    <AnimatePresence>
      {showPlayer && (
        <motion.div
          key="voice-player"
          className="fixed bottom-6 left-1/2 z-50 flex max-w-lg -translate-x-1/2 items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-lg"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="region"
          aria-live="polite"
        >
          <button
            type="button"
            className={topBarIconButtonClass}
            aria-label={t('voice.stop')}
            onClick={stop}
          >
            <Square className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="button"
            className={topBarIconButtonClass}
            aria-label={isPaused ? t('voice.play') : t('voice.pause')}
            onClick={isPaused ? resume : pause}
          >
            {isPaused ? (
              <Play className="h-4 w-4" aria-hidden />
            ) : (
              <Pause className="h-4 w-4" aria-hidden />
            )}
          </button>

          <div className="flex items-end gap-0.5" aria-hidden>
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className={clsx(
                  'h-4 w-1 rounded-full bg-brand-500',
                  isAnimating && 'animate-voice-wave',
                )}
                style={isAnimating ? { animationDelay: `${delay}ms` } : undefined}
              />
            ))}
          </div>

          <p className="min-w-0 flex-1 truncate text-sm text-text-muted">
            {truncateText(currentText)}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

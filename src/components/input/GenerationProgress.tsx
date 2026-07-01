import { AnimatePresence, motion } from 'framer-motion'
import { Brain, CheckCircle, Sparkles, type LucideIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { useQuizStore } from '../../store/quizStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { OfflineGenerationBanner } from './OfflineGenerationBanner'

interface GenerationProgressProps {
  onCancel: () => void
}

type Stage = 1 | 2 | 3

const TIP_KEYS = [
  'quiz.generatingTip1',
  'quiz.generatingTip2',
  'quiz.generatingTip3',
] as const

const STAGE_CONFIG: Record<
  Stage,
  { icon: LucideIcon; labelKey: string; iconClass: string; spin?: boolean }
> = {
  1: {
    icon: Brain,
    labelKey: 'quiz.stageAnalyzing',
    iconClass: 'text-brand-600',
    spin: true,
  },
  2: {
    icon: Sparkles,
    labelKey: 'quiz.stageCrafting',
    iconClass: 'text-brand-600',
  },
  3: {
    icon: CheckCircle,
    labelKey: 'quiz.stageFinalizing',
    iconClass: 'text-success-600',
  },
}

function getStage(progress: number): Stage {
  if (progress <= 30) return 1
  if (progress <= 70) return 2
  return 3
}

const fadeTransition = { duration: 0.2 }

export function GenerationProgress({ onCancel }: GenerationProgressProps) {
  const { t } = useLanguage()
  const generationProgress = useQuizStore((s) => s.generationProgress)
  const stage = getStage(generationProgress)
  const [tipIndex, setTipIndex] = useState(0)

  const { icon: StageIcon, labelKey, iconClass, spin } = STAGE_CONFIG[stage]

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIP_KEYS.length)
    }, 4000)
    return () => window.clearInterval(intervalId)
  }, [])

  const tipKey = useMemo(() => TIP_KEYS[tipIndex], [tipIndex])

  return (
    <>
      <OfflineGenerationBanner onOffline={onCancel} />
      <Card className="flex flex-col items-center gap-5 px-6 py-10">
        <div
          role="status"
          aria-busy="true"
          aria-live="polite"
          className="flex w-full max-w-sm flex-col items-center gap-5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={fadeTransition}
              className="flex flex-col items-center gap-3 text-center"
            >
              <StageIcon
                className={`h-12 w-12 ${iconClass} ${spin ? 'animate-spin' : ''}`}
                aria-hidden
              />
              <p className="text-base font-semibold text-text-primary dark:text-gray-100">
                {t(labelKey)}
              </p>
            </motion.div>
          </AnimatePresence>

          <ProgressBar
            value={generationProgress}
            animated
            variant="primary"
            className="w-full"
          />

          <div className="min-h-[2.5rem] w-full text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fadeTransition}
                className="text-sm text-text-muted dark:text-gray-400"
              >
                {t(tipKey)}
              </motion.p>
            </AnimatePresence>
          </div>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            {t('input.cancelGeneration')}
          </Button>
        </div>
      </Card>
    </>
  )
}

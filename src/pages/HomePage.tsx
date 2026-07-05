import clsx from 'clsx'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  Globe,
  MessageSquareText,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { PageMeta } from '../components/seo/PageMeta'
import {
  InputModeTabs,
  type InputMode,
} from '../components/input/InputModeTabs'
import type { PDFUploaderHandle } from '../components/input/PDFUploader'
import {
  PromptBuilder,
  type PromptBuilderHandle,
} from '../components/input/PromptBuilder'
import {
  QuizSettingsPanel,
  type QuizSettingsPanelHandle,
} from '../components/input/QuizSettingsPanel'
import {
  TextInputPanel,
  type TextInputPanelHandle,
} from '../components/input/TextInputPanel'
import { GenerateButton } from '../components/input/GenerateButton'
import { useInViewReveal } from '../hooks/useInViewReveal'
import { useLanguage } from '../hooks/useLanguage'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useSpeechCleanup } from '../hooks/useSpeechCleanup'
import { useQuizStore } from '../store/quizStore'
import type { RegenerateState } from '../types/regenerate'
import type { Quiz } from '../types/quiz'
import { MOTION, cappedStaggerDelay } from '../utils/motionTokens'
import { Spinner } from '../components/ui/Spinner'

const PDFUploader = lazy(() =>
  import('../components/input/PDFUploader').then((mod) => ({
    default: mod.PDFUploader,
  })),
)

const containerVariants: Variants = {
  hidden: {},
  show: {},
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION.duration.standard,
      delay: cappedStaggerDelay(index, 50, 300) / 1000,
      ease: MOTION.easeStandard,
    },
  }),
}

type FeatureConfig = {
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
  gradientClass: string
}

const FEATURES: FeatureConfig[] = [
  {
    icon: Volume2,
    titleKey: 'home.featureVoiceTitle',
    descriptionKey: 'home.featureVoiceDescription',
    gradientClass: 'from-brand-50/90 via-violet-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950',
  },
  {
    icon: Globe,
    titleKey: 'home.featureMultilingualTitle',
    descriptionKey: 'home.featureMultilingualDescription',
    gradientClass: 'from-blue-50/90 via-brand-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950',
  },
  {
    icon: MessageSquareText,
    titleKey: 'home.featureExplanationsTitle',
    descriptionKey: 'home.featureExplanationsDescription',
    gradientClass: 'from-purple-50/90 via-brand-50/50 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-950',
  },
]

function FeatureHighlightCard({
  icon: Icon,
  title,
  description,
  gradientClass,
  index,
}: {
  icon: LucideIcon
  title: string
  description: string
  gradientClass: string
  index: number
}) {
  return (
    <motion.div variants={cardVariants} custom={index}>
      <div
        className={clsx(
          'rounded-2xl border border-gray-100 bg-gradient-to-br p-5 shadow-sm dark:border-gray-800 dark:shadow-none',
          'motion-safe:transition-[box-shadow] motion-safe:duration-standard motion-safe:ease-standard',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-elevation-2',
          gradientClass,
        )}
      >
        <Icon className="mb-3 h-6 w-6 text-brand-600" aria-hidden />
        <h3 className="text-base font-semibold text-text-primary dark:text-gray-100">
          {title}
        </h3>
        <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const prefersReducedMotion = useReducedMotion()
  const { ref: featuresRef, isInView: featuresInView } = useInViewReveal()
  useSpeechCleanup()
  const location = useLocation()
  const navigate = useNavigate()
  const isGenerating = useQuizStore((s) => s.isGenerating)
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [textContent, setTextContent] = useState('')
  const [pdfContent, setPdfContent] = useState('')
  const [promptTopic, setPromptTopic] = useState('')

  useEffect(() => {
    const reg = location.state?.regenerate as RegenerateState | undefined
    if (!reg?.sourceContent) return

    const mode = reg.sourceType === 'prompt' ? 'prompt' : 'text'
    setInputMode(mode)
    if (mode === 'text') {
      setTextContent(reg.sourceContent)
    } else {
      setPromptTopic(reg.sourceContent)
    }

    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  const textPanelRef = useRef<TextInputPanelHandle>(null)
  const pdfPanelRef = useRef<PDFUploaderHandle>(null)
  const promptPanelRef = useRef<PromptBuilderHandle>(null)
  const settingsPanelRef = useRef<QuizSettingsPanelHandle>(null)

  const handlePromptChange = useCallback(
    (data: { topic: string; prompt: string }) => {
      setPromptTopic(data.topic)
    },
    [],
  )

  const getGenerationInput = useCallback(async (): Promise<
    | { ok: true; content: string; sourceType: Quiz['sourceType'] }
    | { ok: false }
  > => {
    const settingsResult = await settingsPanelRef.current?.validate()
    if (!settingsResult?.ok) {
      settingsPanelRef.current?.expand()
      return { ok: false }
    }

    switch (inputMode) {
      case 'text': {
        const result = await textPanelRef.current?.validate()
        if (!result?.ok) return { ok: false }
        return { ok: true, content: result.content, sourceType: 'text' }
      }
      case 'pdf': {
        const result = await pdfPanelRef.current?.validate()
        if (!result?.ok) return { ok: false }
        return { ok: true, content: result.content, sourceType: 'pdf' }
      }
      case 'prompt': {
        const result = await promptPanelRef.current?.validate()
        if (!result?.ok) return { ok: false }
        return { ok: true, content: result.content, sourceType: 'prompt' }
      }
      default:
        return { ok: false }
    }
  }, [inputMode])

  const isGenerateDisabled = useMemo(() => {
    switch (inputMode) {
      case 'text':
        return !textContent.trim()
      case 'pdf':
        return !pdfContent.trim()
      case 'prompt':
        return !promptTopic.trim()
      default:
        return true
    }
  }, [inputMode, textContent, pdfContent, promptTopic])

  const pageTitle = 'QuizForge — Turn Any Content Into a Quiz'

  return (
    <PageWrapper>
      <PageMeta
        title={pageTitle}
        openGraph={{
          title: pageTitle,
          description: t('home.heroSubtitle'),
          image: '/og-image.png',
          type: 'website',
        }}
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[11fr_9fr]">
        <div className="flex flex-col gap-6">
          {!isGenerating && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-text-primary dark:text-gray-100">
                  {t('home.heroTitle')}
                </h1>
                <p className="mt-2 text-text-muted dark:text-gray-400">{t('home.heroSubtitle')}</p>
              </div>

              <InputModeTabs mode={inputMode} onModeChange={setInputMode} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={inputMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {inputMode === 'text' && (
                    <TextInputPanel
                      ref={textPanelRef}
                      hideSubmit
                      initialContent={
                        inputMode === 'text' ? textContent : undefined
                      }
                      onContentChange={setTextContent}
                    />
                  )}
                  {inputMode === 'pdf' && (
                    <Suspense
                      fallback={
                        <div className="flex justify-center py-12">
                          <Spinner />
                        </div>
                      }
                    >
                      <PDFUploader
                        ref={pdfPanelRef}
                        onExtracted={setPdfContent}
                      />
                    </Suspense>
                  )}
                  {inputMode === 'prompt' && (
                    <PromptBuilder
                      ref={promptPanelRef}
                      hideSubmit
                      initialTopic={
                        inputMode === 'prompt' ? promptTopic : undefined
                      }
                      onPromptChange={handlePromptChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <QuizSettingsPanel ref={settingsPanelRef} />
            </>
          )}

          <GenerateButton
            getGenerationInput={getGenerationInput}
            disabled={isGenerateDisabled}
          />
        </div>

        {!isGenerating && (
          <motion.div
            ref={featuresRef}
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial={prefersReducedMotion ? 'show' : 'hidden'}
            animate={featuresInView || prefersReducedMotion ? 'show' : 'hidden'}
          >
            {FEATURES.map((feature, index) => (
              <FeatureHighlightCard
                key={feature.titleKey}
                index={index}
                icon={feature.icon}
                title={t(feature.titleKey)}
                description={t(feature.descriptionKey)}
                gradientClass={feature.gradientClass}
              />
            ))}
          </motion.div>
        )}
      </div>
    </PageWrapper>
  )
}

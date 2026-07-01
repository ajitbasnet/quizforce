import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
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
import { useLanguage } from '../hooks/useLanguage'
import { useSpeechCleanup } from '../hooks/useSpeechCleanup'
import { useQuizStore } from '../store/quizStore'
import type { RegenerateState } from '../types/regenerate'
import type { Quiz } from '../types/quiz'
import { Spinner } from '../components/ui/Spinner'

const GenerateButton = lazy(() =>
  import('../components/input/GenerateButton').then((mod) => ({
    default: mod.GenerateButton,
  })),
)

const PDFUploader = lazy(() =>
  import('../components/input/PDFUploader').then((mod) => ({
    default: mod.PDFUploader,
  })),
)

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
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
}: {
  icon: LucideIcon
  title: string
  description: string
  gradientClass: string
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={clsx(
        'rounded-2xl border border-gray-100 bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:shadow-none',
        gradientClass,
      )}
    >
      <Icon className="mb-3 h-6 w-6 text-brand-600" aria-hidden />
      <h3 className="text-base font-semibold text-text-primary dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-text-muted dark:text-gray-400">{description}</p>
    </motion.div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
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

          <Suspense fallback={null}>
            <GenerateButton
              getGenerationInput={getGenerationInput}
              disabled={isGenerateDisabled}
            />
          </Suspense>
        </div>

        {!isGenerating && (
          <motion.div
            className="flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {FEATURES.map((feature) => (
              <FeatureHighlightCard
                key={feature.titleKey}
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

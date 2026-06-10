import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Globe,
  MessageSquareText,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { GenerateButton } from '../components/input/GenerateButton'
import {
  InputModeTabs,
  type InputMode,
} from '../components/input/InputModeTabs'
import { PDFUploader } from '../components/input/PDFUploader'
import { PromptBuilder } from '../components/input/PromptBuilder'
import { QuizSettingsPanel } from '../components/input/QuizSettingsPanel'
import { TextInputPanel } from '../components/input/TextInputPanel'
import { useLanguage } from '../hooks/useLanguage'
import { useQuizStore } from '../store/quizStore'
import type { Quiz } from '../types/quiz'
import { promptTopicSchema, textInputSchema } from '../utils/validators'

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
    gradientClass: 'from-indigo-50/90 via-violet-50/50 to-white',
  },
  {
    icon: Globe,
    titleKey: 'home.featureMultilingualTitle',
    descriptionKey: 'home.featureMultilingualDescription',
    gradientClass: 'from-blue-50/90 via-indigo-50/50 to-white',
  },
  {
    icon: MessageSquareText,
    titleKey: 'home.featureExplanationsTitle',
    descriptionKey: 'home.featureExplanationsDescription',
    gradientClass: 'from-purple-50/90 via-indigo-50/50 to-white',
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
        'rounded-2xl border border-gray-100 bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md',
        gradientClass,
      )}
    >
      <Icon className="mb-3 h-6 w-6 text-indigo-600" aria-hidden />
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </motion.div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const isGenerating = useQuizStore((s) => s.isGenerating)
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [textContent, setTextContent] = useState('')
  const [pdfContent, setPdfContent] = useState('')
  const [promptTopic, setPromptTopic] = useState('')
  const [promptContent, setPromptContent] = useState('')

  const handlePromptChange = useCallback(
    (data: { topic: string; prompt: string }) => {
      setPromptTopic(data.topic)
      setPromptContent(data.prompt)
    },
    [],
  )

  const getGenerationInput = useCallback((): {
    ok: true
    content: string
    sourceType: Quiz['sourceType']
  } | { ok: false; error: string } => {
    switch (inputMode) {
      case 'text': {
        const result = textInputSchema.safeParse(textContent)
        if (!result.success) {
          return { ok: false, error: t('input.textMinLengthError') }
        }
        return { ok: true, content: result.data, sourceType: 'text' }
      }
      case 'pdf':
        if (!pdfContent.trim()) {
          return { ok: false, error: t('input.pdfNotReady') }
        }
        return { ok: true, content: pdfContent, sourceType: 'pdf' }
      case 'prompt': {
        const result = promptTopicSchema.safeParse(promptTopic)
        if (!result.success) {
          return { ok: false, error: t('input.topicRequiredError') }
        }
        return { ok: true, content: promptContent, sourceType: 'prompt' }
      }
      default:
        return { ok: false, error: t('errors.invalidInput') }
    }
  }, [inputMode, textContent, pdfContent, promptTopic, promptContent, t])

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

  return (
    <PageWrapper>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[11fr_9fr]">
        <div className="flex flex-col gap-6">
          {!isGenerating && (
            <>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  {t('home.heroTitle')}
                </h1>
                <p className="mt-2 text-text-muted">{t('home.heroSubtitle')}</p>
              </div>

              <InputModeTabs onModeChange={setInputMode} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={inputMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {inputMode === 'text' && (
                    <TextInputPanel
                      hideSubmit
                      onContentChange={setTextContent}
                    />
                  )}
                  {inputMode === 'pdf' && (
                    <PDFUploader onExtracted={setPdfContent} />
                  )}
                  {inputMode === 'prompt' && (
                    <PromptBuilder
                      hideSubmit
                      onPromptChange={handlePromptChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <QuizSettingsPanel />
            </>
          )}

          <GenerateButton
            getGenerationInput={getGenerationInput}
            disabled={isGenerateDisabled}
          />
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

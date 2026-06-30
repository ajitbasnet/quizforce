import clsx from 'clsx'
import { useCallback } from 'react'
import { AppearanceSection } from '../components/settings/AppearanceSection'
import { DataPrivacySection } from '../components/settings/DataPrivacySection'
import { QuizDefaultsSection } from '../components/settings/QuizDefaultsSection'
import { VoiceSettingsSection } from '../components/settings/VoiceSettingsSection'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useLanguage } from '../hooks/useLanguage'

const SECTION_IDS = ['defaults', 'voice', 'appearance', 'data'] as const

type SectionId = (typeof SECTION_IDS)[number]

const SECTION_LABEL_KEYS: Record<SectionId, string> = {
  defaults: 'settings.sectionDefaults',
  voice: 'settings.sectionVoice',
  appearance: 'settings.sectionAppearance',
  data: 'settings.sectionData',
}

export default function SettingsPage() {
  const { t } = useLanguage()

  const scrollToSection = useCallback((id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <PageWrapper title={t('settings.title')}>
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav
          aria-label={t('settings.title')}
          className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {SECTION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollToSection(id)}
              className={clsx(
                'shrink-0 rounded-pill px-4 py-2 text-left text-sm font-medium transition-colors',
                'text-text-muted hover:bg-surface-subtle hover:text-text-primary',
                'lg:rounded-lg',
              )}
            >
              {t(SECTION_LABEL_KEYS[id])}
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-6">
          <QuizDefaultsSection />
          <VoiceSettingsSection />
          <AppearanceSection />
          <DataPrivacySection />
        </div>
      </div>
    </PageWrapper>
  )
}

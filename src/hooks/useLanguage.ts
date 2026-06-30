import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'
import { useSettingsStore } from '../store/settingsStore'
import type { SupportedLanguage } from '../types/quiz'
import {
  applyDocumentLanguage,
  persistLanguage,
  readExplicitLanguage,
} from '../utils/languageLocale'

export function useLanguage() {
  const { t, i18n } = useTranslation()
  const currentLang = useSettingsStore((s) => s.settings.language)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const [hydrated, setHydrated] = useState(() => useSettingsStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
    setHydrated(useSettingsStore.persist.hasHydrated())
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const explicitLang = readExplicitLanguage()
    const lang = explicitLang ?? currentLang

    if (explicitLang && explicitLang !== currentLang) {
      updateSettings({ language: explicitLang })
    }

    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang)
    }
    applyDocumentLanguage(lang)
  }, [hydrated, i18n, currentLang, updateSettings])

  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang)
    updateSettings({ language: lang })
    applyDocumentLanguage(lang)
    persistLanguage(lang)
  }

  return {
    t,
    changeLanguage,
    currentLang,
    supportedLanguages: SUPPORTED_LANGUAGES,
  }
}

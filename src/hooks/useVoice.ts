import { useCallback } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useVoiceStore } from '../store/voiceStore'
import { resolveLang } from '../utils/voiceLang'

const isSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

let hasWarnedUnsupported = false

const utteranceRef: { current: SpeechSynthesisUtterance | null } = {
  current: null,
}
const speechQueueRef: { current: string[] } = { current: [] }
let sequenceLang: string | undefined
let pausedDuringQuestion = false

function noop() {}

function applyVoiceSettings(utterance: SpeechSynthesisUtterance, lang?: string) {
  const { voiceRate, voicePitch, voiceURI } =
    useSettingsStore.getState().settings

  utterance.rate = voiceRate
  utterance.pitch = voicePitch
  utterance.lang = resolveLang(lang)

  if (voiceURI) {
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find((v) => v.voiceURI === voiceURI)
    if (voice) utterance.voice = voice
  }
}

function attachUtteranceHandlers(
  utterance: SpeechSynthesisUtterance,
  onEnd: () => void,
) {
  const { setSpeaking, setPaused } = useVoiceStore.getState()

  utterance.onstart = () => setSpeaking(true)
  utterance.onend = () => {
    if (utteranceRef.current === utterance) {
      onEnd()
    }
  }
  utterance.onerror = () => {
    if (utteranceRef.current === utterance) {
      speechQueueRef.current = []
      utteranceRef.current = null
      useVoiceStore.getState().endSpeech()
    }
  }
  utterance.onpause = () => setPaused(true)
  utterance.onresume = () => setPaused(false)
}

function cancelSpeech() {
  speechQueueRef.current = []
  window.speechSynthesis.cancel()
  utteranceRef.current = null
}

function speakNextInQueue() {
  const next = speechQueueRef.current.shift()
  if (!next) {
    utteranceRef.current = null
    useVoiceStore.getState().endSpeech()
    return
  }

  const { setCurrentText } = useVoiceStore.getState()
  const utterance = new SpeechSynthesisUtterance(next)
  applyVoiceSettings(utterance, sequenceLang)
  attachUtteranceHandlers(utterance, speakNextInQueue)

  setCurrentText(next)
  utteranceRef.current = utterance
  window.speechSynthesis.speak(utterance)
}

function speakText(text: string, lang?: string) {
  cancelSpeech()
  useVoiceStore.getState().clearVoice()

  const { setCurrentText, setLastSpokenText } = useVoiceStore.getState()
  setCurrentText(text)
  setLastSpokenText(text)

  const utterance = new SpeechSynthesisUtterance(text)
  applyVoiceSettings(utterance, lang)
  attachUtteranceHandlers(utterance, () => {
    utteranceRef.current = null
    useVoiceStore.getState().endSpeech()
  })

  utteranceRef.current = utterance
  window.speechSynthesis.speak(utterance)
}

function speakSequenceTexts(texts: string[], lang?: string) {
  const filtered = texts.map((t) => t.trim()).filter(Boolean)
  if (filtered.length === 0) return

  cancelSpeech()
  useVoiceStore.getState().clearVoice()

  const fullText = filtered.join(' ')
  const { setLastSpokenText } = useVoiceStore.getState()
  setLastSpokenText(fullText)

  sequenceLang = lang
  speechQueueRef.current = [...filtered]
  speakNextInQueue()
}

function chainSpeakSequenceTexts(texts: string[], lang?: string) {
  const filtered = texts.map((t) => t.trim()).filter(Boolean)
  if (filtered.length === 0) {
    utteranceRef.current = null
    useVoiceStore.getState().endSpeech()
    return
  }

  sequenceLang = lang
  speechQueueRef.current = [...filtered]
  speakNextInQueue()
}

function speakQuestionThenOptions(
  questionText: string,
  optionTexts: string[],
  lang?: string,
) {
  const trimmedQuestion = questionText.trim()
  if (!trimmedQuestion) return

  pausedDuringQuestion = false
  cancelSpeech()
  useVoiceStore.getState().clearVoice()

  const filteredOptions = optionTexts.map((t) => t.trim()).filter(Boolean)
  const fullText = [trimmedQuestion, ...filteredOptions].join(' ')
  const { setCurrentText, setLastSpokenText, setSpeaking, setPaused } =
    useVoiceStore.getState()
  setCurrentText(trimmedQuestion)
  setLastSpokenText(fullText)

  const utterance = new SpeechSynthesisUtterance(trimmedQuestion)
  applyVoiceSettings(utterance, lang)

  utterance.onstart = () => setSpeaking(true)
  utterance.onpause = () => {
    setPaused(true)
    pausedDuringQuestion = true
  }
  utterance.onresume = () => setPaused(false)
  utterance.onerror = () => {
    if (utteranceRef.current === utterance) {
      speechQueueRef.current = []
      utteranceRef.current = null
      pausedDuringQuestion = false
      useVoiceStore.getState().endSpeech()
    }
  }
  utterance.onend = () => {
    if (utteranceRef.current !== utterance) return
    utteranceRef.current = null

    if (pausedDuringQuestion) {
      pausedDuringQuestion = false
      useVoiceStore.getState().endSpeech()
      return
    }

    chainSpeakSequenceTexts(filteredOptions, lang)
  }

  utteranceRef.current = utterance
  window.speechSynthesis.speak(utterance)
}

export function useVoice() {
  const isSpeaking = useVoiceStore((s) => s.isSpeaking)
  const isPaused = useVoiceStore((s) => s.isPaused)
  const currentText = useVoiceStore((s) => s.currentText)
  const lastSpokenText = useVoiceStore((s) => s.lastSpokenText)

  if (!isSupported && !hasWarnedUnsupported) {
    hasWarnedUnsupported = true
    console.warn('Text-to-speech is not supported in this browser.')
  }

  const stop = useCallback(() => {
    if (!isSupported) return
    pausedDuringQuestion = false
    cancelSpeech()
    useVoiceStore.getState().clearVoice()
  }, [])

  const pause = useCallback(() => {
    if (!isSupported || !utteranceRef.current) return
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
  }, [])

  const speak = useCallback((text: string, lang?: string) => {
    if (!isSupported || !text.trim()) return
    speakText(text, lang)
  }, [])

  const speakSequence = useCallback((texts: string[], lang?: string) => {
    if (!isSupported) return
    speakSequenceTexts(texts, lang)
  }, [])

  const speakQuestionThenOptionsFn = useCallback(
    (questionText: string, optionTexts: string[], lang?: string) => {
      if (!isSupported) return
      speakQuestionThenOptions(questionText, optionTexts, lang)
    },
    [],
  )

  const speakAgain = useCallback(() => {
    if (!isSupported) return
    const { lastSpokenText: text } = useVoiceStore.getState()
    if (!text.trim()) return
    speakText(text)
  }, [])

  if (!isSupported) {
    return {
      speak: noop,
      speakSequence: noop,
      speakQuestionThenOptions: noop,
      speakAgain: noop,
      stop: noop,
      pause: noop,
      resume: noop,
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      lastSpokenText: '',
      isSupported: false as const,
    }
  }

  return {
    speak,
    speakSequence,
    speakQuestionThenOptions: speakQuestionThenOptionsFn,
    speakAgain,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    currentText,
    lastSpokenText,
    isSupported: true as const,
  }
}

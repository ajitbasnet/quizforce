import clsx from 'clsx'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { Modal } from '../ui/Modal'

export interface QuestionMapProps {
  total: number
  currentIndex: number
  isAnswered: (index: number) => boolean
  onJump: (index: number) => void
}

function QuestionDot({
  index,
  currentIndex,
  isAnswered,
  onJump,
  onSelect,
}: {
  index: number
  currentIndex: number
  isAnswered: (index: number) => boolean
  onJump: (index: number) => void
  onSelect?: () => void
}) {
  const { t } = useLanguage()
  const isCurrent = index === currentIndex
  const answered = isAnswered(index)

  const handleClick = () => {
    onJump(index)
    onSelect?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('quiz.jumpToQuestion', { number: index + 1 })}
      aria-current={isCurrent ? 'step' : undefined}
      className={clsx(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-micro',
        isCurrent &&
          'scale-110 animate-pulse border-brand-600 bg-brand-600 text-white ring-2 ring-white ring-offset-2 ring-offset-brand-600 dark:ring-gray-900 dark:ring-offset-brand-600',
        !isCurrent &&
          answered &&
          'border-brand-600 bg-brand-600 text-white [@media(hover:hover)]:hover:bg-brand-700',
        !isCurrent &&
          !answered &&
          'border-gray-300 bg-surface text-text-muted [@media(hover:hover)]:hover:border-brand-400 [@media(hover:hover)]:hover:bg-brand-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400 dark:[@media(hover:hover)]:hover:border-indigo-400 dark:[@media(hover:hover)]:hover:bg-gray-800',
      )}
    >
      {index + 1}
    </button>
  )
}

export function QuestionMap({
  total,
  currentIndex,
  isAnswered,
  onJump,
}: QuestionMapProps) {
  const { t } = useLanguage()
  const [modalOpen, setModalOpen] = useState(false)

  const dots = Array.from({ length: total }, (_, index) => (
    <QuestionDot
      key={index}
      index={index}
      currentIndex={currentIndex}
      isAnswered={isAnswered}
      onJump={onJump}
    />
  ))

  const modalDots = Array.from({ length: total }, (_, index) => (
    <QuestionDot
      key={index}
      index={index}
      currentIndex={currentIndex}
      isAnswered={isAnswered}
      onJump={onJump}
      onSelect={() => setModalOpen(false)}
    />
  ))

  return (
    <>
      <div className="hidden sm:block">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{dots}</div>
      </div>

      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-surface px-4 text-sm font-medium text-text-primary transition-colors duration-micro [@media(hover:hover)]:hover:bg-surface-muted dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:[@media(hover:hover)]:hover:bg-gray-800"
        >
          {t('quiz.questionMapMobile', {
            current: currentIndex + 1,
            total,
          })}
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('quiz.questionMapTitle')}
        size="sm"
      >
        <div className="flex flex-wrap justify-center gap-3">{modalDots}</div>
      </Modal>
    </>
  )
}

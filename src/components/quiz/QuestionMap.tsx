import clsx from 'clsx'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { Button } from '../ui/Button'
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
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-150',
        isCurrent &&
          'scale-110 animate-pulse border-indigo-600 bg-indigo-600 text-white ring-2 ring-white ring-offset-2 ring-offset-indigo-600',
        !isCurrent && answered && 'border-indigo-600 bg-indigo-600 text-white',
        !isCurrent && !answered && 'border-gray-300 bg-white text-text-muted',
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
      <div className="hidden md:block">
        <div className="flex gap-2 overflow-x-auto pb-1">{dots}</div>
      </div>

      <div className="md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          {t('quiz.questionMapMobile', {
            current: currentIndex + 1,
            total,
          })}
        </Button>
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

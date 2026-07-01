import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz } from '../../types/quiz'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface SourceContentCollapsibleProps {
  quiz: Quiz
}

export function SourceContentCollapsible({ quiz }: SourceContentCollapsibleProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  if (!quiz.sourceContent.trim()) {
    return null
  }

  return (
    <section>
      <Button
        type="button"
        variant="ghost"
        className="mb-2 px-0"
        rightIcon={
          <ChevronDown
            className={clsx(
              'h-4 w-4 transition-transform',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        }
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {t('history.viewOriginalContent')}
      </Button>
      {open ? (
        <Card className="p-0">
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 text-sm text-text-primary dark:text-gray-100">
            {quiz.sourceContent}
          </pre>
        </Card>
      ) : null}
    </section>
  )
}

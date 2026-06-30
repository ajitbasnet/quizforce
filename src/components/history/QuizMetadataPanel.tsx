import { LANGUAGE_OPTIONS } from '../../i18n'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz } from '../../types/quiz'
import { formatCompletionDate } from '../../utils/formatDate'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const SOURCE_BADGE_CONFIG: Record<
  Quiz['sourceType'],
  { labelKey: string; variant?: 'info' | 'warning'; className?: string }
> = {
  text: { labelKey: 'history.sourceText', variant: 'info' },
  pdf: { labelKey: 'history.sourcePdf', variant: 'warning' },
  prompt: {
    labelKey: 'history.sourcePrompt',
    className: 'bg-purple-100 text-purple-700',
  },
  url: {
    labelKey: 'history.sourceUrl',
    className: 'bg-teal-100 text-teal-700',
  },
}

const DIFFICULTY_KEYS: Record<Quiz['settings']['difficulty'], string> = {
  easy: 'input.difficultyEasy',
  medium: 'input.difficultyMedium',
  hard: 'input.difficultyHard',
  mixed: 'input.difficultyMixed',
}

interface QuizMetadataPanelProps {
  quiz: Quiz
}

export function QuizMetadataPanel({ quiz }: QuizMetadataPanelProps) {
  const { t, currentLang } = useLanguage()
  const sourceBadge = SOURCE_BADGE_CONFIG[quiz.sourceType]
  const flag =
    LANGUAGE_OPTIONS.find((opt) => opt.code === quiz.language)?.flag ?? ''
  const languageName = t(`settings.languages.${quiz.language}`)
  const difficultyKey = DIFFICULTY_KEYS[quiz.settings.difficulty]

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{quiz.title}</h2>
        {quiz.description ? (
          <p className="mt-1 text-sm text-text-muted">{quiz.description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={sourceBadge.variant}
          size="sm"
          className={sourceBadge.className}
        >
          {t(sourceBadge.labelKey)}
        </Badge>
        {flag ? (
          <Badge variant="default" size="sm">
            {flag} {languageName}
          </Badge>
        ) : null}
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-text-muted">{t('history.questionsCount', { count: quiz.questions.length })}</dt>
          <dd className="font-medium text-text-primary">
            {t('history.pointsCount', { pts: quiz.totalPoints })}
          </dd>
        </div>
        <div>
          <dt className="text-text-muted">{t('input.difficulty')}</dt>
          <dd className="font-medium text-text-primary">{t(difficultyKey)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-text-muted">{t('history.createdOn')}</dt>
          <dd className="font-medium text-text-primary">
            {formatCompletionDate(quiz.createdAt, currentLang)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}

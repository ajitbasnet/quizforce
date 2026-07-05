import clsx from 'clsx'
import { Bookmark, FileText, Sparkles, Upload, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  type HistoryFilters,
  type HistorySort,
  type HistorySourceFilter,
} from '../../hooks/useHistory'
import { useLanguage } from '../../hooks/useLanguage'
import { getTagColorClass } from '../../utils/tagColors'
import { Select } from '../ui/Select'
import { historyPillRowClass, historyToolbarRowClass } from './historyToolbarStyles'

interface HistoryFilterToolbarProps {
  filters: HistoryFilters
  onFiltersChange: (partial: Partial<HistoryFilters>) => void
}

type SourcePill = {
  type: HistorySourceFilter
  labelKey: string
  icon?: LucideIcon
}

const SOURCE_PILLS: SourcePill[] = [
  { type: 'all', labelKey: 'history.filterAll' },
  { type: 'text', labelKey: 'history.sourceText', icon: FileText },
  { type: 'pdf', labelKey: 'history.sourcePdf', icon: Upload },
  { type: 'prompt', labelKey: 'history.sourcePrompt', icon: Sparkles },
]

const SORT_OPTIONS: { value: HistorySort; labelKey: string }[] = [
  { value: 'latest', labelKey: 'history.sortLatest' },
  { value: 'oldest', labelKey: 'history.sortOldest' },
  { value: 'highest', labelKey: 'history.sortHighestScore' },
  { value: 'questions', labelKey: 'history.sortMostQuestions' },
]

export function HistoryFilterToolbar({
  filters,
  onFiltersChange,
}: HistoryFilterToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className="mb-6 flex min-w-0 flex-col gap-3">
      <div className={historyToolbarRowClass}>
        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-text-muted dark:text-gray-400">
          {t('history.filterSourceType')}
        </span>
        <div
          className={historyPillRowClass}
          role="group"
          aria-label={t('history.filterSourceType')}
        >
          {SOURCE_PILLS.map(({ type, labelKey, icon: Icon }) => {
            const active = filters.type === type
            return (
              <button
                key={type}
                type="button"
                aria-pressed={active}
                className={clsx(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
                  active
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-text-muted hover:bg-gray-200 hover:text-text-primary dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                )}
                onClick={() => onFiltersChange({ type })}
              >
                {Icon ? (
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                ) : null}
                {t(labelKey)}
              </button>
            )
          })}
          <button
            type="button"
            aria-pressed={filters.starred}
            className={clsx(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
              filters.starred
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-text-muted hover:bg-gray-200 hover:text-text-primary dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100',
            )}
            onClick={() => onFiltersChange({ starred: !filters.starred })}
          >
            <Bookmark
              className={clsx(
                'h-3.5 w-3.5 shrink-0',
                filters.starred && 'fill-current',
              )}
              aria-hidden
            />
            {t('history.starred')}
          </button>
        </div>

        <Select
          value={filters.sort}
          onChange={(event) =>
            onFiltersChange({ sort: event.target.value as HistorySort })
          }
          className="ms-auto w-44 shrink-0 py-1.5 text-sm"
          aria-label={t('history.sortBy')}
        >
          {SORT_OPTIONS.map(({ value, labelKey }) => (
            <option key={value} value={value}>
              {t(labelKey)}
            </option>
          ))}
        </Select>
      </div>

      {filters.tag ? (
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={clsx(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium',
              getTagColorClass(filters.tag),
            )}
          >
            #{filters.tag}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-black/10"
              aria-label={t('history.clearTagFilter')}
              onClick={() => onFiltersChange({ tag: null })}
            >
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          </span>
        </div>
      ) : null}
    </div>
  )
}

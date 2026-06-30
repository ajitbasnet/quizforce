import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useHistoryStore } from '../store/historyStore'
import type { Quiz, QuizAttempt } from '../types/quiz'

export type HistorySourceFilter = 'all' | 'text' | 'pdf' | 'prompt'
export type HistorySort = 'latest' | 'oldest' | 'highest' | 'questions'

export interface HistoryFilters {
  q: string
  type: HistorySourceFilter
  sort: HistorySort
  starred: boolean
  tag: string | null
}

export interface HistoryStats {
  totalQuizzes: number
  totalQuestionsAnswered: number
  bestScore: number
  averageScore: number
}

const SOURCE_FILTERS: HistorySourceFilter[] = ['all', 'text', 'pdf', 'prompt']
const SORT_OPTIONS: HistorySort[] = ['latest', 'oldest', 'highest', 'questions']

const SOURCE_SEARCH_LABELS: Record<Quiz['sourceType'], string[]> = {
  text: ['text'],
  pdf: ['pdf'],
  prompt: ['prompt'],
  url: ['url'],
}

function parseSourceFilter(value: string | null): HistorySourceFilter {
  if (value && SOURCE_FILTERS.includes(value as HistorySourceFilter)) {
    return value as HistorySourceFilter
  }
  return 'all'
}

function parseSort(value: string | null): HistorySort {
  if (value && SORT_OPTIONS.includes(value as HistorySort)) {
    return value as HistorySort
  }
  return 'latest'
}

function matchesSearch(quiz: Quiz, query: string): boolean {
  if (!query) return true

  const haystack = [
    quiz.title,
    quiz.description,
    quiz.sourceType,
    ...SOURCE_SEARCH_LABELS[quiz.sourceType],
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}

export function useHistory() {
  const quizzes = useHistoryStore((s) => s.quizzes)
  const attempts = useHistoryStore((s) => s.attempts)
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo((): HistoryFilters => {
    const tag = searchParams.get('tag')
    return {
      q: searchParams.get('q') ?? '',
      type: parseSourceFilter(searchParams.get('type')),
      sort: parseSort(searchParams.get('sort')),
      starred: searchParams.get('starred') === '1',
      tag: tag || null,
    }
  }, [searchParams])

  const setFilters = useCallback(
    (partial: Partial<HistoryFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)

          if (partial.q !== undefined) {
            if (partial.q) next.set('q', partial.q)
            else next.delete('q')
          }

          if (partial.type !== undefined) {
            if (partial.type === 'all') next.delete('type')
            else next.set('type', partial.type)
          }

          if (partial.sort !== undefined) {
            if (partial.sort === 'latest') next.delete('sort')
            else next.set('sort', partial.sort)
          }

          if (partial.starred !== undefined) {
            if (partial.starred) next.set('starred', '1')
            else next.delete('starred')
          }

          if (partial.tag !== undefined) {
            if (partial.tag) next.set('tag', partial.tag)
            else next.delete('tag')
          }

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setSearchQuery = useCallback(
    (q: string) => setFilters({ q }),
    [setFilters],
  )

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const getLatestAttempt = useCallback(
    (quizId: string): QuizAttempt | null => {
      const latest = attempts
        .filter((a) => a.quizId === quizId)
        .sort(
          (a, b) =>
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime(),
        )[0]
      return latest ?? null
    },
    [attempts],
  )

  const stats = useMemo((): HistoryStats => {
    const totalQuizzes = quizzes.length
    const totalQuestionsAnswered = attempts.reduce(
      (sum, attempt) => sum + attempt.feedback.length,
      0,
    )

    if (attempts.length === 0) {
      return {
        totalQuizzes,
        totalQuestionsAnswered,
        bestScore: 0,
        averageScore: 0,
      }
    }

    const percentages = attempts.map((a) => a.percentage)
    const bestScore = Math.max(...percentages)
    const averageScore = Math.round(
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
    )

    return {
      totalQuizzes,
      totalQuestionsAnswered,
      bestScore,
      averageScore,
    }
  }, [quizzes.length, attempts])

  const filteredQuizzes = useMemo(() => {
    const query = filters.q.trim().toLowerCase()

    let result = quizzes.filter((quiz) => {
      if (!matchesSearch(quiz, query)) return false
      if (filters.type !== 'all' && quiz.sourceType !== filters.type) {
        return false
      }
      if (filters.starred && !(quiz.isFavorited ?? false)) return false
      if (filters.tag && !(quiz.tags ?? []).includes(filters.tag)) {
        return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        case 'highest': {
          const aScore = getLatestAttempt(a.id)?.percentage ?? 0
          const bScore = getLatestAttempt(b.id)?.percentage ?? 0
          return bScore - aScore
        }
        case 'questions':
          return b.questions.length - a.questions.length
        case 'latest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
      }
    })

    return result
  }, [quizzes, filters, getLatestAttempt])

  return {
    quizzes,
    getLatestAttempt,
    stats,
    filters,
    setFilters,
    searchQuery: filters.q,
    setSearchQuery,
    clearFilters,
    filteredQuizzes,
  }
}

import { motion } from 'framer-motion'
import { Layers, MessageSquare, TrendingUp, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import type { HistoryStats } from '../../hooks/useHistory'
import { Card } from '../ui/Card'

interface HistoryStatsBarProps {
  stats: HistoryStats
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

interface StatItemConfig {
  icon: LucideIcon
  labelKey: string
  getValue: (stats: HistoryStats) => string
}

const STAT_ITEMS: StatItemConfig[] = [
  {
    icon: Layers,
    labelKey: 'history.statsTotalQuizzes',
    getValue: (stats) => String(stats.totalQuizzes),
  },
  {
    icon: MessageSquare,
    labelKey: 'history.statsQuestionsAnswered',
    getValue: (stats) => String(stats.totalQuestionsAnswered),
  },
  {
    icon: Trophy,
    labelKey: 'history.statsBestScore',
    getValue: (stats) => `${stats.bestScore}%`,
  },
  {
    icon: TrendingUp,
    labelKey: 'history.statsAverageScore',
    getValue: (stats) => `${stats.averageScore}%`,
  },
]

export function HistoryStatsBar({ stats }: HistoryStatsBarProps) {
  const { t } = useLanguage()

  if (stats.totalQuizzes === 0) {
    return null
  }

  return (
    <motion.div
      className="mb-6 flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {STAT_ITEMS.map(({ icon: Icon, labelKey, getValue }) => (
        <motion.div
          key={labelKey}
          variants={cardVariants}
          className="min-w-[10rem] shrink-0 snap-start"
        >
          <Card className="flex h-full flex-col gap-2 p-4">
            <Icon className="h-5 w-5 text-brand-600" aria-hidden />
            <p className="text-xs text-text-muted">{t(labelKey)}</p>
            <p className="text-xl font-bold text-text-primary tabular-nums">
              {getValue(stats)}
            </p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

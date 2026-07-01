const TAG_COLOR_CLASSES = [
  'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  'bg-success-100 text-success-600 dark:bg-success-950/50 dark:text-success-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  'bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300',
  'bg-brand-100 text-brand-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
] as const

export function getTagColorClass(tag: string): string {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TAG_COLOR_CLASSES[Math.abs(hash) % TAG_COLOR_CLASSES.length]
}

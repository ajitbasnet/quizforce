export const fieldLabelClass =
  'block text-sm font-medium text-text-primary dark:text-gray-100 mb-1'
export const fieldHelperClass = 'mt-1 text-xs text-text-muted dark:text-gray-400'
export const fieldErrorClass = 'mt-1 text-xs text-danger-600 dark:text-danger-400'

export const controlBaseClass =
  'w-full rounded-lg border border-gray-200 bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400'

export const controlErrorClass =
  'border-danger-600 focus:ring-danger-600 focus:border-danger-600 dark:border-danger-500 dark:focus:ring-danger-500 dark:focus:border-danger-500'

export function fieldId(label?: string, id?: string): string | undefined {
  if (id) return id
  if (!label) return undefined
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const fieldLabelClass = 'block text-sm font-medium text-text-primary mb-1'
export const fieldHelperClass = 'mt-1 text-xs text-text-muted'
export const fieldErrorClass = 'mt-1 text-xs text-danger-600'

export const controlBaseClass =
  'w-full rounded-lg border border-gray-200 bg-surface text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 disabled:opacity-50 disabled:cursor-not-allowed'

export const controlErrorClass =
  'border-danger-600 focus:ring-danger-600 focus:border-danger-600'

export function fieldId(label?: string, id?: string): string | undefined {
  if (id) return id
  if (!label) return undefined
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

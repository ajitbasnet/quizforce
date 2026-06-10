export const fieldLabelClass = 'block text-sm font-medium text-text-primary mb-1'
export const fieldHelperClass = 'mt-1 text-xs text-text-muted'
export const fieldErrorClass = 'mt-1 text-xs text-danger'

export const controlBaseClass =
  'w-full rounded-lg border border-gray-200 bg-white text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed'

export const controlErrorClass = 'border-danger focus:ring-danger focus:border-danger'

export function fieldId(label?: string, id?: string): string | undefined {
  if (id) return id
  if (!label) return undefined
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

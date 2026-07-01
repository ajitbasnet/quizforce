const TOP_BAR_ACTION_BASE = [
  'transition-[color,background-color,box-shadow,transform] duration-200 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-0',
  'active:scale-[0.97]',
].join(' ')

const TOP_BAR_ACTION_HOVER =
  'hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-gray-800 dark:hover:text-indigo-300'

export const topBarIconButtonClass = [
  'inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium',
  TOP_BAR_ACTION_BASE,
  TOP_BAR_ACTION_HOVER,
  'text-text-muted dark:text-gray-400',
].join(' ')

export const topBarLanguageSelectClass = [
  'appearance-none cursor-pointer rounded-lg bg-transparent py-1.5 pl-2.5 pr-8 text-sm font-medium',
  TOP_BAR_ACTION_BASE,
  TOP_BAR_ACTION_HOVER,
  'text-text-muted dark:text-gray-400',
].join(' ')

export function topBarNavLinkClass(isActive: boolean, iconOnly = false) {
  const layout = iconOnly
    ? 'inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium'
    : 'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium'

  if (isActive) {
    return [
      layout,
      TOP_BAR_ACTION_BASE,
      'bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-indigo-400',
      'hover:bg-brand-100/80 hover:text-brand-700 dark:hover:bg-gray-700 dark:hover:text-indigo-300',
    ].join(' ')
  }

  return [layout, TOP_BAR_ACTION_BASE, TOP_BAR_ACTION_HOVER, 'text-text-muted dark:text-gray-400'].join(
    ' ',
  )
}

export function topBarToggleClass(isActive: boolean) {
  return [
    topBarIconButtonClass,
    isActive &&
      'bg-brand-50 text-brand-600 hover:bg-brand-100/80 dark:bg-gray-800 dark:text-indigo-400 dark:hover:bg-gray-700',
  ]
    .filter(Boolean)
    .join(' ')
}

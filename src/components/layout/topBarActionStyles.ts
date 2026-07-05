import clsx from 'clsx'

/** Shared motion + interaction base for every top-bar utility control. */
const TOP_BAR_UTILITY_INTERACTION = [
  'motion-safe:transition-[color,background-color,transform]',
  'motion-safe:duration-micro motion-safe:ease-standard',
  'motion-safe:active:scale-[0.97] motion-safe:active:duration-micro',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-0',
  'dark:focus-visible:ring-offset-gray-950',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-50',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
].join(' ')

const TOP_BAR_UTILITY_RESTING = 'bg-transparent text-text-muted dark:text-gray-400'

const TOP_BAR_UTILITY_PERSISTENT =
  'bg-brand-50 text-brand-600 dark:bg-gray-800 dark:text-indigo-400 [@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-100/80 [@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-700 dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300'

export interface TopBarUtilityOptions {
  /** Route is currently active (e.g. History). */
  isActive?: boolean
  /** Toggle is on (e.g. voice enabled). */
  isToggled?: boolean
  /** Icon-only control (voice, settings). */
  iconOnly?: boolean
  /** Non-interactive status chip (syncing). */
  isStatus?: boolean
}

export function topBarUtilityClass({
  isActive = false,
  isToggled = false,
  iconOnly = false,
  isStatus = false,
}: TopBarUtilityOptions = {}): string {
  const isPersistent = isActive || isToggled

  return clsx(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium',
    iconOnly ? 'p-2' : 'px-3 py-1.5',
    TOP_BAR_UTILITY_INTERACTION,
    isPersistent ? TOP_BAR_UTILITY_PERSISTENT : TOP_BAR_UTILITY_RESTING,
    isStatus && 'cursor-default',
  )
}

/** @deprecated Use topBarUtilityClass — kept for QuizPage / VoicePlayer controls. */
export const topBarIconButtonClass = topBarUtilityClass({ iconOnly: true })

export function topBarNavLinkClass(isActive: boolean, iconOnly = false): string {
  return topBarUtilityClass({ isActive, iconOnly })
}

export function topBarToggleClass(isActive: boolean): string {
  return topBarUtilityClass({ isToggled: isActive, iconOnly: true })
}

/** Sidebar nav row — hover matches top-bar utility tint; active bg is the sliding pill. */
export function sidebarNavLinkClass(
  isActive: boolean,
  collapsed: boolean,
): string {
  return clsx(
    'relative z-10 flex items-center rounded-lg text-sm font-medium',
    'motion-safe:transition-[color,background-color] motion-safe:duration-micro motion-safe:ease-standard',
    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
    isActive
      ? 'text-brand-600 dark:text-indigo-400'
      : [
          'text-text-muted dark:text-gray-400',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-50',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
          'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800',
          'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
        ],
  )
}

/** @deprecated Language select styling — use LanguageSelector variant="topBar". */
export const topBarLanguageSelectClass = topBarUtilityClass()

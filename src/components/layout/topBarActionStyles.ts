import clsx from 'clsx'

/** Shared motion + interaction base for every top-bar utility control. */
const TOP_BAR_UTILITY_INTERACTION = [
  'group/topbar relative',
  'motion-safe:transition-[color,background-color,transform,box-shadow]',
  'motion-safe:duration-micro motion-safe:ease-standard',
  'motion-safe:active:scale-[0.97] motion-safe:active:duration-micro',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-0',
  'dark:focus-visible:ring-offset-gray-950',
  '[@media(hover:hover)_and_(pointer:fine)]:motion-safe:hover:-translate-y-px',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-50/80',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_0_0_1px_rgba(79,70,229,0.14)]',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800/90',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.22)]',
  '[&_svg]:motion-safe:transition-[color,transform] [&_svg]:motion-safe:duration-micro',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/topbar:[&_svg]:scale-[1.06]',
  '[@media(hover:hover)_and_(pointer:fine)]:group-hover/topbar:[&_svg]:text-brand-600',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:group-hover/topbar:[&_svg]:text-indigo-400',
].join(' ')

const TOP_BAR_UTILITY_RESTING = 'bg-transparent text-text-muted dark:text-gray-400'

const TOP_BAR_UTILITY_PERSISTENT = [
  'bg-brand-50/90 text-brand-600',
  'shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]',
  'dark:bg-gray-800/90 dark:text-indigo-400',
  'dark:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.18)]',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-100/70',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
  '[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_0_0_1px_rgba(79,70,229,0.2)]',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-700/90',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
  'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[inset_0_0_0_1px_rgba(129,140,248,0.28)]',
].join(' ')

export interface TopBarUtilityOptions {
  /** Route is currently active (e.g. History). */
  isActive?: boolean
  /** Toggle is on (e.g. voice enabled, menu open). */
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
    !isStatus && TOP_BAR_UTILITY_INTERACTION,
    isPersistent ? TOP_BAR_UTILITY_PERSISTENT : TOP_BAR_UTILITY_RESTING,
    isStatus && 'cursor-default bg-transparent text-text-muted dark:text-gray-400',
  )
}

/** Account avatar — matches utility hover language in a circular control. */
export function topBarAvatarClass(isOpen = false): string {
  return clsx(
    topBarUtilityClass({ isToggled: isOpen, iconOnly: true }),
    'h-8 w-8 rounded-full text-xs font-semibold',
    'bg-brand-100 text-brand-700 dark:bg-indigo-950/60 dark:text-indigo-300',
    isOpen && 'ring-2 ring-brand-500/25 dark:ring-indigo-400/30',
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
          '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-brand-50/80',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:text-brand-700',
          'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:bg-gray-800/90',
          'dark:[@media(hover:hover)_and_(pointer:fine)]:hover:text-indigo-300',
        ],
  )
}

/** @deprecated Language select styling — use LanguageSelector variant="topBar". */
export const topBarLanguageSelectClass = topBarUtilityClass()

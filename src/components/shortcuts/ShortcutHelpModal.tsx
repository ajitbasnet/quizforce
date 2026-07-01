import { Modal } from '../ui/Modal'
import {
  SHORTCUT_REGISTRY,
  type ShortcutContext,
  type ShortcutDef,
} from '../../hooks/useKeyboardShortcuts'
import { useLanguage } from '../../hooks/useLanguage'

const kbdClass =
  'inline-flex min-w-[1.5rem] items-center justify-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'

interface ShortcutHelpModalProps {
  isOpen: boolean
  onClose: () => void
  context: ShortcutContext
}

function visibleShortcuts(context: ShortcutContext): ShortcutDef[] {
  return SHORTCUT_REGISTRY.filter(
    (def) => def.context === 'global' || def.context === context,
  )
}

export function ShortcutHelpModal({
  isOpen,
  onClose,
  context,
}: ShortcutHelpModalProps) {
  const { t } = useLanguage()
  const shortcuts = visibleShortcuts(context)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('shortcuts.title')} size="md">
      <table className="w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">{t('shortcuts.actionColumn')}</th>
            <th scope="col">{t('shortcuts.shortcutColumn')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {shortcuts.map((def) => (
            <tr key={def.id}>
              <td className="py-3 pr-4 text-text-primary dark:text-gray-100">
                {t(def.descriptionKey)}
              </td>
              <td className="py-3 text-right">
                <span className="inline-flex shrink-0 items-center justify-end gap-1">
                  {def.displayKeys.map((key) =>
                    key === '–' ? (
                      <span key={key} className="text-text-muted dark:text-gray-400">
                        –
                      </span>
                    ) : (
                      <kbd key={key} className={kbdClass}>
                        {key}
                      </kbd>
                    ),
                  )}
                  {def.hintKey && (
                    <span className="ml-1 text-text-muted dark:text-gray-400">({t(def.hintKey)})</span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}

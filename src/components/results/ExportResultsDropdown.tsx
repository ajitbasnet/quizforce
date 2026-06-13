import clsx from 'clsx'
import {
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  Printer,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import type { Quiz, QuizAttempt } from '../../types/quiz'
import {
  buildResultsCsvData,
  buildResultsJson,
  getResultsExportFilename,
} from '../../utils/buildResultsExport'
import { csvExport } from '../../utils/csvExport'
import { downloadFile } from '../../utils/downloadFile'
import { Button } from '../ui/Button'

interface ExportResultsDropdownProps {
  quiz: Quiz
  attempt: QuizAttempt
}

export function ExportResultsDropdown({
  quiz,
  attempt,
}: ExportResultsDropdownProps) {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, close])

  const handlePrint = () => {
    close()
    window.print()
  }

  const handleExportJson = () => {
    close()
    const json = buildResultsJson(quiz, attempt)
    const filename = getResultsExportFilename(quiz, 'json')
    downloadFile(json, filename, 'application/json')
  }

  const handleExportCsv = () => {
    close()
    const { headers, rows } = buildResultsCsvData(quiz, attempt)
    const filename = getResultsExportFilename(quiz, 'csv')
    csvExport(headers, rows, filename)
  }

  return (
    <div ref={containerRef} className="relative print:hidden">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        aria-haspopup="menu"
        aria-expanded={open}
        leftIcon={<Download className="h-4 w-4" aria-hidden />}
        rightIcon={<ChevronDown className="h-4 w-4" aria-hidden />}
        onClick={() => setOpen((prev) => !prev)}
      >
        {t('results.exportResults')}
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label={t('results.exportResults')}
          className="absolute right-0 top-full z-50 mt-1 min-w-[220px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg"
        >
          <ExportMenuItem
            icon={Printer}
            label={t('results.exportPrintPdf')}
            onClick={handlePrint}
          />
          <ExportMenuItem
            icon={FileJson}
            label={t('results.exportJson')}
            onClick={handleExportJson}
          />
          <ExportMenuItem
            icon={FileSpreadsheet}
            label={t('results.exportCsv')}
            onClick={handleExportCsv}
          />
        </div>
      ) : null}
    </div>
  )
}

function ExportMenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={clsx(
        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm',
        'text-text-primary transition-colors hover:bg-gray-50',
        'focus-visible:bg-gray-50 focus-visible:outline-none',
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
      {label}
    </button>
  )
}

import clsx from 'clsx'
import { CheckCircle2, Upload, XCircle } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import {
  extractTextFromPDF,
  PDF_MAX_FILE_SIZE_BYTES,
  PDFParseError,
  PDFPasswordError,
} from '../../utils/pdfParser'
import { pdfSchema } from '../../utils/validators'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'

export interface PDFUploaderHandle {
  validate: () => Promise<{ ok: true; content: string } | { ok: false }>
}

interface PDFUploaderProps {
  onExtracted: (text: string) => void
}

type UploaderState = 'idle' | 'dragging' | 'processing' | 'success' | 'error'

function isPdfFile(file: File): boolean {
  return (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  )
}

export const PDFUploader = forwardRef<PDFUploaderHandle, PDFUploaderProps>(
  function PDFUploader({ onExtracted }, ref) {
    const { t } = useLanguage()
    const inputRef = useRef<HTMLInputElement>(null)
    const dragDepthRef = useRef(0)

    const [state, setState] = useState<UploaderState>('idle')
    const [file, setFile] = useState<File | null>(null)
    const [extractedText, setExtractedText] = useState('')
    const [pageCount, setPageCount] = useState(0)
    const [errorMessage, setErrorMessage] = useState<string | undefined>()
    const [submitValidationError, setSubmitValidationError] = useState<
      string | undefined
    >()

    const setError = useCallback(
      (message: string) => {
        setErrorMessage(message)
        setState('error')
      },
      [],
    )

    const processFile = useCallback(
      async (selectedFile: File) => {
        if (!isPdfFile(selectedFile)) {
          setError(t('input.pdfInvalidType'))
          return
        }

        if (selectedFile.size > PDF_MAX_FILE_SIZE_BYTES) {
          setError(t('errors.pdfTooLarge'))
          return
        }

        setFile(selectedFile)
        setErrorMessage(undefined)
        setSubmitValidationError(undefined)
        setState('processing')

        try {
          const result = await extractTextFromPDF(selectedFile)
          setExtractedText(result.text)
          setPageCount(result.pageCount)
          setState('success')
          onExtracted(result.text)
        } catch (error) {
          if (error instanceof PDFPasswordError) {
            setError(t('input.pdfPasswordProtected'))
          } else if (error instanceof PDFParseError) {
            setError(t('errors.pdfParseFailed'))
          } else {
            setError(t('errors.generic'))
          }
        }
      },
      [onExtracted, setError, t],
    )

    useImperativeHandle(
      ref,
      () => ({
        validate: async () => {
          if (state !== 'success' || !extractedText.trim()) {
            setSubmitValidationError(t('input.pdfNotReady'))
            return { ok: false }
          }

          const result = pdfSchema.safeParse(extractedText)
          if (!result.success) {
            setSubmitValidationError(t('input.pdfTooShort'))
            return { ok: false }
          }

          setSubmitValidationError(undefined)
          return { ok: true, content: result.data }
        },
      }),
      [state, extractedText, t],
    )

    const handleRetry = () => {
      setState('idle')
      setFile(null)
      setExtractedText('')
      setPageCount(0)
      setErrorMessage(undefined)
      setSubmitValidationError(undefined)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (state === 'processing') return
      dragDepthRef.current += 1
      setState('dragging')
    }

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      if (state === 'processing') return
      dragDepthRef.current -= 1
      if (dragDepthRef.current <= 0) {
        dragDepthRef.current = 0
        setState('idle')
      }
    }

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
    }

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      dragDepthRef.current = 0
      if (state === 'processing') return

      const droppedFile = event.dataTransfer.files[0]
      if (droppedFile) {
        void processFile(droppedFile)
      } else {
        setState('idle')
      }
    }

    const handleZoneClick = () => {
      if (state === 'processing') return
      inputRef.current?.click()
    }

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0]
      if (selectedFile) {
        void processFile(selectedFile)
      }
    }

    const isDragging = state === 'dragging'
    const isInteractive = state !== 'processing'
    const hasSubmitError = !!submitValidationError

    return (
      <div className="w-full">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={handleFileChange}
          aria-hidden
          tabIndex={-1}
        />

        <div
          role="region"
          aria-label={t('input.pdfLabel')}
          aria-busy={state === 'processing'}
          onClick={isInteractive ? handleZoneClick : undefined}
          onDragEnter={isInteractive ? handleDragEnter : undefined}
          onDragLeave={isInteractive ? handleDragLeave : undefined}
          onDragOver={isInteractive ? handleDragOver : undefined}
          onDrop={isInteractive ? handleDrop : undefined}
          className={clsx(
            'relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors',
            isInteractive && 'cursor-pointer',
            isDragging
              ? 'border-indigo-500 bg-indigo-100/50 animate-dash-border'
              : 'border-indigo-200 bg-indigo-50/50',
            (state === 'error' || hasSubmitError) &&
              'border-red-200 bg-red-50/50',
            state === 'success' && !hasSubmitError && 'border-green-200 bg-green-50/50',
          )}
        >
          {state === 'processing' && (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" className="text-indigo-600" />
              <p className="text-sm font-medium text-text-primary">
                {t('input.pdfExtracting')}
              </p>
            </div>
          )}

          {state === 'success' && file && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden />
              <p className="text-sm font-semibold text-text-primary">{file.name}</p>
              <p className="text-sm text-text-muted">
                {t('input.pdfPageCount', { count: pageCount.toLocaleString() })}
                {' · '}
                {t('input.pdfCharCount', {
                  count: extractedText.length.toLocaleString(),
                })}
              </p>
              <p className="text-sm font-medium text-green-700">{t('input.pdfReady')}</p>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-10 w-10 text-red-600" aria-hidden />
              <p className="text-sm text-red-700" role="alert">
                {errorMessage}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation()
                  handleRetry()
                }}
              >
                {t('input.pdfRetry')}
              </Button>
            </div>
          )}

          {(state === 'idle' || state === 'dragging') && (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-indigo-500" aria-hidden />
              <p className="text-sm font-medium text-text-primary">
                {t('input.pdfDropzone')}
              </p>
            </div>
          )}
        </div>

        {submitValidationError && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            {submitValidationError}
          </p>
        )}
      </div>
    )
  },
)

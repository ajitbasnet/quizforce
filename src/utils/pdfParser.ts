import * as pdfjsLib from 'pdfjs-dist'
import { stripHtmlTags } from './sanitizeText'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

export const PDF_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

const MAX_PAGES = 50
const MAX_TEXT_LENGTH = 12000
const TRUNCATION_SUFFIX = '[...truncated]'

const isE2ePdfMock = import.meta.env.VITE_E2E_MOCK_PDF === 'true'

export interface PDFExtractResult {
  text: string
  pageCount: number
  totalPages: number
}

export class PDFPasswordError extends Error {
  constructor(message = 'PDF is password-protected') {
    super(message)
    this.name = 'PDFPasswordError'
  }
}

export class PDFParseError extends Error {
  constructor(message = 'Failed to parse PDF file') {
    super(message)
    this.name = 'PDFParseError'
  }
}

function isPasswordProtectedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const name = error.name.toLowerCase()
  const message = error.message.toLowerCase()

  return (
    name.includes('password') ||
    message.includes('password') ||
    message.includes('encrypted')
  )
}

function isInvalidPdfError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const name = error.name.toLowerCase()
  const message = error.message.toLowerCase()

  return (
    name.includes('invalidpdf') ||
    name.includes('missingpdf') ||
    message.includes('invalid pdf') ||
    message.includes('corrupt')
  )
}

function mapPdfError(error: unknown): never {
  if (isPasswordProtectedError(error)) {
    throw new PDFPasswordError(
      error instanceof Error ? error.message : undefined,
    )
  }

  if (isInvalidPdfError(error)) {
    throw new PDFParseError(
      error instanceof Error ? error.message : undefined,
    )
  }

  if (error instanceof PDFPasswordError || error instanceof PDFParseError) {
    throw error
  }

  throw new PDFParseError(
    error instanceof Error ? error.message : undefined,
  )
}

function truncateText(text: string): string {
  const cleaned = text.trim()
  if (cleaned.length <= MAX_TEXT_LENGTH) return cleaned
  return `${cleaned.slice(0, MAX_TEXT_LENGTH)}${TRUNCATION_SUFFIX}`
}

export async function validatePdfMagicBytes(file: File): Promise<boolean> {
  if (isE2ePdfMock) return true

  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer())
  return (
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46 &&
    header[4] === 0x2d
  )
}

export async function extractTextFromPDF(
  file: File,
): Promise<PDFExtractResult> {
  if (isE2ePdfMock) {
    const text = truncateText(stripHtmlTags(await file.text()))
    if (!text) {
      throw new PDFParseError('No text could be extracted from PDF')
    }
    return { text, pageCount: 1, totalPages: 1 }
  }

  const hasPdfHeader = await validatePdfMagicBytes(file)
  if (!hasPdfHeader) {
    throw new PDFParseError('Invalid PDF file')
  }

  try {
    const data = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data }).promise
    const pageCount = Math.min(pdf.numPages, MAX_PAGES)
    const pageTexts: string[] = []

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim()

      if (pageText) {
        pageTexts.push(pageText)
      }
    }

    if (pageTexts.length === 0) {
      throw new PDFParseError('No text could be extracted from PDF')
    }

    const text = truncateText(stripHtmlTags(pageTexts.join('\n')))
    return { text, pageCount, totalPages: pdf.numPages }
  } catch (error) {
    mapPdfError(error)
  }
}

import { downloadFile } from './downloadFile'

export function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function csvExport(
  headers: string[],
  rows: (string | number | boolean)[][],
  filename: string,
): void {
  const lines = [
    headers.map((header) => escapeCsvCell(String(header))).join(','),
    ...rows.map((row) =>
      row.map((cell) => escapeCsvCell(String(cell))).join(','),
    ),
  ]
  const csv = lines.join('\r\n')
  downloadFile(csv, filename, 'text/csv;charset=utf-8')
}

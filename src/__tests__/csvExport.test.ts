import { describe, expect, it, vi } from 'vitest'
import { csvExport, escapeCsvCell } from '../utils/csvExport'
import * as downloadModule from '../utils/downloadFile'

describe('escapeCsvCell', () => {
  it('quotes cells with commas or quotes', () => {
    expect(escapeCsvCell('hello, world')).toBe('"hello, world"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('returns plain values unchanged', () => {
    expect(escapeCsvCell('simple')).toBe('simple')
  })
})

describe('csvExport', () => {
  it('builds CSV and triggers download', () => {
    const downloadSpy = vi.spyOn(downloadModule, 'downloadFile').mockImplementation(() => {})

    csvExport(['Name', 'Score'], [['Alice', 10]], 'scores.csv')

    expect(downloadSpy).toHaveBeenCalledWith(
      'Name,Score\r\nAlice,10',
      'scores.csv',
      'text/csv;charset=utf-8',
    )

    downloadSpy.mockRestore()
  })
})

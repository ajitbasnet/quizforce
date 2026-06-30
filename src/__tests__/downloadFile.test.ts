import { describe, expect, it, vi } from 'vitest'
import { downloadFile } from '../utils/downloadFile'

describe('downloadFile', () => {
  it('creates a blob link and clicks the anchor', () => {
    const click = vi.fn()
    const anchor = {
      href: '',
      download: '',
      style: { display: '' },
      click,
    } as unknown as HTMLAnchorElement

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor)
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchor)
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchor)
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock')

    downloadFile('hello', 'test.txt', 'text/plain')

    expect(createObjectURLSpy).toHaveBeenCalled()
    expect(anchor.download).toBe('test.txt')
    expect(click).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalledWith('blob:mock')

    createElementSpy.mockRestore()
    appendSpy.mockRestore()
    removeSpy.mockRestore()
    revokeSpy.mockRestore()
    createObjectURLSpy.mockRestore()
  })
})

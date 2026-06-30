/**
 * Strips HTML tags from user-provided text before API calls and storage.
 */
export function stripHtmlTags(text: string): string {
  if (!text) return text

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(text, 'text/html')
    return doc.body.textContent ?? ''
  }

  return text.replace(/<[^>]*>/g, '')
}

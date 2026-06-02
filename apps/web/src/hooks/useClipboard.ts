import { useCallback, useState } from 'react'

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function useClipboard() {
  const [copied, setCopied] = useState(false)

  const copyText = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return true
      }
    } catch {
      // fallthrough to fallback
    }

    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      if (successful) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        return true
      }
    } catch {
      document.body.removeChild(textArea)
    }
    return false
  }, [])

  const copyHTML = useCallback(
    async (html: string): Promise<boolean> => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          const blobHTML = new Blob([html], { type: 'text/html' })
          const blobText = new Blob([stripHtml(html)], { type: 'text/plain' })
          const item = new ClipboardItem({ 'text/html': blobHTML, 'text/plain': blobText })
          await navigator.clipboard.write([item])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          return true
        }
      } catch {
        // fallthrough to fallback
      }

      // Fallback: create hidden contenteditable div
      const div = document.createElement('div')
      div.innerHTML = html
      div.contentEditable = 'true'
      div.style.position = 'fixed'
      div.style.left = '-9999px'
      div.style.top = '0'
      document.body.appendChild(div)

      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(div)
      selection?.removeAllRanges()
      selection?.addRange(range)

      try {
        const successful = document.execCommand('copy')
        document.body.removeChild(div)
        if (successful) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          return true
        }
      } catch {
        document.body.removeChild(div)
      }
      return false
    },
    [copyText]
  )

  return { copied, copyText, copyHTML }
}

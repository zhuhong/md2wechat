import { useState, useEffect } from 'react'
import { renderToWechatHTML } from '@md2wechat/core'

export function useMarkdownParser(markdown: string, theme?: string) {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    renderToWechatHTML(markdown, { theme })
      .then((result) => {
        if (!cancelled) {
          setHtml(result)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.warn('Core renderer error', e)
          setError(String(e))
          setHtml(`<div style="padding:1rem;color:red">Renderer error: ${String(e)}</div>`)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [markdown, theme])

  return { html, loading, error }
}

import { useState, useEffect, useMemo } from 'react'
import {
  renderToWechatHTML,
  mergeThemePresetWithOverrides,
  defaultTheme,
  minimalTheme,
  techTheme,
  elegantTheme,
} from '@md2wechat/core'
import type { Theme } from '@md2wechat/core'
import { useCustomThemeStore } from '@/stores/customThemeStore'

function getPresetTheme(themeId?: string): Theme {
  if (!themeId || themeId === 'default') return defaultTheme
  if (themeId === 'minimal') return minimalTheme
  if (themeId === 'tech') return techTheme
  if (themeId === 'elegant') return elegantTheme
  return defaultTheme
}

export function useMarkdownParser(markdown: string, theme?: string) {
  const overrides = useCustomThemeStore((s) => s.overrides)

  const mergedTheme = useMemo(() => {
    const base = getPresetTheme(theme)
    return mergeThemePresetWithOverrides(base, overrides)
  }, [theme, overrides])

  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    renderToWechatHTML(markdown, { theme: mergedTheme })
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
  }, [markdown, mergedTheme])

  return { html, loading, error }
}

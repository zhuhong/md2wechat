import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useMarkdownParser } from '@/hooks/useMarkdownParser'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export default function WechatPreview() {
  const { content, renderTheme, setRenderedPreviewHtml } = useEditorStore()
  const { html, loading } = useMarkdownParser(content, renderTheme)
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (!articleRef.current) return

      // PlantUML is processed synchronously
      const plantUmls = articleRef.current.querySelectorAll<HTMLDivElement>(
        '[data-diagram-type="plantuml"]'
      )
      plantUmls.forEach((el) => {
        const raw = el.getAttribute('data-diagram')
        if (!raw) return
        const plantumlUrl = 'https://www.plantuml.com/plantuml/svg/' + raw
        el.innerHTML = `
          <div style="border:1px solid #e2e8f0;border-radius:6px;background:#f8f9fa;padding:12px;margin:1em 0;">
            <div style="font-size:12px;color:#718096;margin-bottom:8px;">PlantUML 图表</div>
            <pre style="font-size:12px;line-height:1.5;color:#2d3748;background:#fff;padding:8px;border-radius:4px;overflow-x:auto;border:1px solid #e2e8f0;">${escapeHtml(raw)}</pre>
            <a href="${plantumlUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;font-size:13px;color:#3182ce;text-decoration:none;font-weight:500;">🌐 在 plantuml.com 查看图表</a>
          </div>
        `
      })

      // Mermaid is loaded on-demand only when the document contains mermaid diagrams
      const mermaids = articleRef.current.querySelectorAll<HTMLDivElement>(
        '[data-diagram-type="mermaid"]'
      )

      let promises: Promise<void>[] = []

      if (mermaids.length > 0) {
        const mermaid = (await import('mermaid')).default
        if (cancelled) return
        mermaid.initialize({ startOnLoad: false })

        promises = Array.from(mermaids).map(async (el) => {
          if (cancelled) return
          const code = el.getAttribute('data-diagram')
          if (!code) return
          const id = 'mermaid-' + Math.random().toString(36).slice(2)
          try {
            const { svg } = await mermaid.render(id, code)
            if (!cancelled) el.innerHTML = svg
          } catch (err: any) {
            if (!cancelled) {
              el.innerHTML = `<div style="color:red">Mermaid error: ${err.message}</div>`
            }
          }
        })
      }

      await Promise.all(promises)

      if (!cancelled && articleRef.current) {
        setRenderedPreviewHtml(articleRef.current.innerHTML)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [html, setRenderedPreviewHtml])

  return (
    <div
      className="bg-white shadow-sm border rounded-sm overflow-hidden"
      style={{ width: 375, minHeight: 600 }}
    >
      <div className="bg-muted text-xs text-muted-foreground px-3 py-1.5 text-center border-b">
        微信公众号文章预览 · 375px
      </div>
      {loading && (
        <div className="p-8 text-center text-muted-foreground text-sm">
          渲染中...
        </div>
      )}
      <article
        ref={articleRef}
        className="max-w-none p-4 bg-white"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
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
  const { content, renderTheme } = useEditorStore()
  const { html, loading } = useMarkdownParser(content, renderTheme)
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!articleRef.current) return
    mermaid.initialize({ startOnLoad: false })

    const mermaids = articleRef.current.querySelectorAll<HTMLDivElement>('.mermaid')
    mermaids.forEach((el) => {
      const code = el.getAttribute('data-diagram')
      if (!code) return
      const id = 'mermaid-' + Math.random().toString(36).slice(2)
      mermaid
        .render(id, code)
        .then(({ svg }) => {
          el.innerHTML = svg
        })
        .catch((err: Error) => {
          el.innerHTML = `<div style="color:red">Mermaid error: ${err.message}</div>`
        })
    })

    const plantUmls = articleRef.current.querySelectorAll<HTMLDivElement>('.plantuml')
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
  }, [html])

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

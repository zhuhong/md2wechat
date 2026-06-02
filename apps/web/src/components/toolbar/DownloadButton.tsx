import { useEditorStore } from '@/stores/editorStore'
import { useMarkdownParser } from '@/hooks/useMarkdownParser'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DownloadButton() {
  const { content, filename } = useEditorStore()
  const { html, loading } = useMarkdownParser(content)

  const handleDownload = () => {
    if (loading || !html) return
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title></head><body style="max-width:677px;margin:0 auto;padding:1em;">${html}</body></html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.replace('.md', '.html')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      onClick={handleDownload}
      size="sm"
      className="gap-1.5"
      variant="outline"
      disabled={loading}
    >
      <Download className="w-4 h-4" />
      下载 HTML
    </Button>
  )
}

import { useEditorStore } from '@/stores/editorStore'
import { useClipboard } from '@/hooks/useClipboard'
import { useMarkdownParser } from '@/hooks/useMarkdownParser'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CopyButton() {
  const { content, renderTheme, renderedPreviewHtml } = useEditorStore()
  const { copied, copyHTML } = useClipboard()
  const { html, loading } = useMarkdownParser(content, renderTheme)

  const finalHtml = renderedPreviewHtml || html

  const handleCopy = async () => {
    if (loading || !finalHtml) return
    await copyHTML(finalHtml)
  }

  return (
    <Button
      onClick={handleCopy}
      size="sm"
      className="gap-1.5"
      variant={copied ? 'secondary' : 'default'}
      disabled={loading}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? '已复制' : '复制 HTML'}
    </Button>
  )
}

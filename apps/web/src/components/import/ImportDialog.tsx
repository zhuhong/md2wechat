import { useState } from 'react'
import { useConnector } from '@/hooks/useConnector'
import { X, Link2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type Source = 'feishu' | 'notion'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: (markdown: string) => void
}

const sources: { key: Source; label: string }[] = [
  { key: 'feishu', label: '飞书' },
  { key: 'notion', label: 'Notion' },
]

export default function ImportDialog({ open, onClose, onSuccess }: ImportDialogProps) {
  const [source, setSource] = useState<Source>('feishu')
  const [url, setUrl] = useState('')
  const { importFeishu, importNotion, loading, error } = useConnector()

  if (!open) return null

  const handleImport = async () => {
    if (!url.trim()) return
    try {
      const result = source === 'feishu'
        ? await importFeishu(url.trim())
        : await importNotion(url.trim())
      onSuccess(result.markdown)
      setUrl('')
      onClose()
    } catch {
      // error is already handled by the hook and displayed below
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleImport()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-popover text-popover-foreground shadow-lg p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">导入文档</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent transition-colors"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source tabs */}
        <div className="flex rounded-md bg-muted p-0.5 mb-4">
          {sources.map((s) => (
            <button
              key={s.key}
              onClick={() => setSource(s.key)}
              className={cn(
                'flex-1 px-3 py-1.5 text-sm font-medium rounded-sm transition-colors',
                source === s.key
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* URL input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5">
            {source === 'feishu' ? '飞书文档 URL' : 'Notion 页面 URL'}
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                source === 'feishu'
                  ? 'https://xxx.feishu.cn/docx/...'
                  : 'https://www.notion.so/...'
              }
              className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              disabled={loading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导入中…
              </>
            ) : (
              <>导入</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

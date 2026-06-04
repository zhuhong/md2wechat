import { useState } from 'react'
import { useConnector } from '@/hooks/useConnector'
import { X, Link2, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
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
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <div className="font-medium">{error.title}</div>
                  <div className="mt-1 text-destructive/90">{error.message}</div>
                </div>

                {(error.code || error.requiredScopes?.length) && (
                  <div className="space-y-1.5 rounded-md bg-background/70 p-2 text-xs text-foreground">
                    {error.code && (
                      <div className="flex gap-2">
                        <span className="shrink-0 text-muted-foreground">错误码</span>
                        <code className="font-mono">{error.code}</code>
                      </div>
                    )}
                    {error.requiredScopes?.length ? (
                      <div className="flex gap-2">
                        <span className="shrink-0 text-muted-foreground">缺失权限</span>
                        <div className="flex min-w-0 flex-wrap gap-1">
                          {error.requiredScopes.map((scope) => (
                            <code
                              key={scope}
                              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground"
                            >
                              {scope}
                            </code>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {(error.actionUrl || error.troubleshootingUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {error.actionUrl && (
                      <a
                        href={error.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        开通权限
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {error.troubleshootingUrl && (
                      <a
                        href={error.troubleshootingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-background px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        查看排查建议
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}

                {error.raw && error.raw !== error.message && (
                  <details className="text-xs text-destructive/80">
                    <summary className="cursor-pointer select-none">查看原始错误</summary>
                    <pre className="mt-2 max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-background/70 p-2 font-mono text-[11px] leading-relaxed text-foreground">
                      {error.raw}
                    </pre>
                  </details>
                )}
              </div>
            </div>
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

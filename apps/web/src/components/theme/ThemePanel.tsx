import { useCustomThemeStore } from '@/stores/customThemeStore'
import { X, RotateCcw } from 'lucide-react'

const DEFAULTS = {
  fontSize: 16,
  lineHeight: 1.6,
  primaryTextColor: '#333333',
  linkColor: '#2563eb',
  codeColor: '#d946ef',
  paragraphMargin: 16,
  headingMargin: 24,
}

export default function ThemePanel() {
  const {
    panelOpen,
    togglePanel,
    overrides,
    setFontSize,
    setLineHeight,
    setPrimaryTextColor,
    setLinkColor,
    setCodeColor,
    setParagraphMargin,
    setHeadingMargin,
    reset,
  } = useCustomThemeStore()

  const fontSize = overrides.fontSize ?? DEFAULTS.fontSize
  const lineHeight = overrides.lineHeight ?? DEFAULTS.lineHeight
  const primaryTextColor = overrides.primaryTextColor ?? DEFAULTS.primaryTextColor
  const linkColor = overrides.linkColor ?? DEFAULTS.linkColor
  const codeColor = overrides.codeColor ?? DEFAULTS.codeColor
  const paragraphMargin = overrides.paragraphMargin ?? DEFAULTS.paragraphMargin
  const headingMargin = overrides.headingMargin ?? DEFAULTS.headingMargin

  return (
    <div
      className={`fixed top-12 bottom-0 right-0 w-72 bg-card border-l border-border shadow-xl transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        panelOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
        <h2 className="font-semibold text-sm">主题自定义</h2>
        <button
          onClick={togglePanel}
          className="p-1.5 rounded-md hover:bg-accent transition-colors"
          title="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            排版
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">字体大小</label>
                <span className="text-xs tabular-nums">{fontSize}px</span>
              </div>
              <input
                type="range"
                min={12}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">行高</label>
                <span className="text-xs tabular-nums">{lineHeight.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            颜色
          </h3>
          <div className="space-y-3">
            <ColorRow
              label="正文颜色"
              value={primaryTextColor}
              onChange={setPrimaryTextColor}
            />
            <ColorRow
              label="链接颜色"
              value={linkColor}
              onChange={setLinkColor}
            />
            <ColorRow
              label="代码颜色"
              value={codeColor}
              onChange={setCodeColor}
            />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            间距
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">段落间距</label>
                <span className="text-xs tabular-nums">{paragraphMargin}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                value={paragraphMargin}
                onChange={(e) => setParagraphMargin(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">标题间距</label>
                <span className="text-xs tabular-nums">{headingMargin}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={48}
                value={headingMargin}
                onChange={(e) => setHeadingMargin(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={reset}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-accent transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>
    </div>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs tabular-nums text-muted-foreground font-mono">
          {value}
        </span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer appearance-none"
        />
      </div>
    </div>
  )
}

import FileMenu from './FileMenu'
import CopyButton from './CopyButton'
import DownloadButton from './DownloadButton'
import ImportDialog from '@/components/import/ImportDialog'
import { useThemeStore } from '@/stores/themeStore'
import { useEditorStore } from '@/stores/editorStore'
import { useCustomThemeStore } from '@/stores/customThemeStore'
import { FileText, Moon, Sun, Monitor, Palette, Link2, Settings } from 'lucide-react'
import { useState } from 'react'

export default function Toolbar() {
  const { mode, setMode } = useThemeStore()
  const { renderTheme, setRenderTheme, setContent } = useEditorStore()
  const { togglePanel } = useCustomThemeStore()
  const [importOpen, setImportOpen] = useState(false)

  const activeClass = 'bg-accent text-accent-foreground'
  const inactiveClass = 'hover:bg-accent/50'

  return (
    <>
      <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0 z-20">
        <div className="font-bold text-lg tracking-tight mr-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          md2wechat
        </div>

        <FileMenu />

        <button
          onClick={() => setImportOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
        >
          <Link2 className="w-4 h-4" />
          导入
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
          <Palette className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={renderTheme}
            onChange={(e) => setRenderTheme(e.target.value as 'default' | 'minimal' | 'tech' | 'elegant')}
            className="bg-transparent text-sm outline-none cursor-pointer"
          >
            <option value="default">默认主题</option>
            <option value="minimal">极简主题</option>
            <option value="tech">科技风</option>
            <option value="elegant">优雅杂志</option>
          </select>
          <button
            onClick={togglePanel}
            className="p-0.5 rounded-sm hover:bg-accent/50 transition-colors"
            title="自定义主题"
          >
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

      <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
        <button
          onClick={() => setMode('light')}
          className={`p-1.5 rounded-sm transition-colors ${mode === 'light' ? activeClass : inactiveClass}`}
          title="浅色模式"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMode('dark')}
          className={`p-1.5 rounded-sm transition-colors ${mode === 'dark' ? activeClass : inactiveClass}`}
          title="深色模式"
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setMode('system')}
          className={`p-1.5 rounded-sm transition-colors ${mode === 'system' ? activeClass : inactiveClass}`}
          title="跟随系统"
        >
          <Monitor className="w-4 h-4" />
        </button>
      </div>

      <DownloadButton />
      <CopyButton />
    </header>
    <ImportDialog
      open={importOpen}
      onClose={() => setImportOpen(false)}
      onSuccess={(markdown) => setContent(markdown)}
    />
  </>
  )
}

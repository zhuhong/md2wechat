import { useRef, useState } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { readFile, downloadFile, createNewFile } from '@/utils/file'
import { FileText, FolderOpen, Save, Plus } from 'lucide-react'

export default function FileMenu() {
  const [open, setOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { content, setContent, filename, setFilename } = useEditorStore()

  const handleNew = () => {
    const file = createNewFile()
    setContent(file.content)
    setFilename(file.name)
    setOpen(false)
  }

  const handleOpen = () => {
    fileInputRef.current?.click()
    setOpen(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await readFile(file)
    setContent(text)
    setFilename(file.name)
    e.target.value = ''
  }

  const handleSave = () => {
    downloadFile(content, filename, 'text/markdown')
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent transition-colors"
      >
        <FileText className="w-4 h-4" />
        文件
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-48 rounded-md border bg-popover text-popover-foreground shadow-lg z-20 py-1">
            <button
              onClick={handleNew}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Plus className="w-4 h-4" /> 新建
            </button>
            <button
              onClick={handleOpen}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FolderOpen className="w-4 h-4" /> 打开…
            </button>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={handleSave}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

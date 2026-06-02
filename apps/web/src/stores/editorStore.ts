import { create } from 'zustand'
import { loadDraft, saveDraft } from '@/utils/persistence'

type RenderTheme = 'default' | 'minimal' | 'tech' | 'elegant'

interface EditorState {
  content: string
  setContent: (content: string) => void
  filename: string
  setFilename: (filename: string) => void
  isDirty: boolean
  setDirty: (dirty: boolean) => void
  renderTheme: RenderTheme
  setRenderTheme: (theme: RenderTheme) => void
  isLoaded: boolean
  loadDraft: () => Promise<void>
}

const WELCOME_DOC = `# 欢迎使用 md2wechat

> 将 Markdown 一键转换为微信公众号兼容的 HTML。

## 快速开始

在左侧编辑器中输入 **Markdown**，右侧实时预览微信公众号排版效果。

点击右上角 **复制 HTML** 按钮，即可粘贴到公众号编辑器中。

## 支持的语法

### 标题与段落

# 一级标题居中

普通段落支持**加粗**、*斜体*、~~删除线~~，以及 [链接](https://github.com)。

> 引用的样式也有精心设计，左侧带有装饰线。

### 列表

无序列表：
- 支持多级嵌套
- 代码片段内联展示：\`npm install\`
- 表情符号 😄

有序列表：
1. 第一步：编写 Markdown
2. 第二步：预览效果
3. 第三步：复制到公众号

### 代码块

\`\`\`typescript
// 代码高亮支持 20+ 语言
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

### 表格

| 功能 | 状态 | 说明 |
|------|------|------|
| 基础渲染 | ✅ | headings, lists, code |
| 代码高亮 | ✅ | Shiki 驱动 |
| 数学公式 | ✅ | KaTeX |
| 图表 | 🔄 | Mermaid 支持中 |

---

## 快捷键

- \`Ctrl/Cmd + S\`：保存文件
- \`Ctrl/Cmd + O\`：打开文件

> 自动保存草稿功能已上线，每次修改都会自动保存到本地。
`;

export const useEditorStore = create<EditorState>()((set, get) => ({
  content: WELCOME_DOC,
  setContent: (content) => {
    set({ content, isDirty: true })
    saveDraft({ content, filename: get().filename, updatedAt: Date.now() }).catch(() => {
      // Ignore persistence errors
    })
  },
  filename: 'welcome.md',
  setFilename: (filename) => {
    set({ filename })
    saveDraft({ content: get().content, filename, updatedAt: Date.now() }).catch(() => {
      // Ignore persistence errors
    })
  },
  isDirty: false,
  setDirty: (isDirty) => set({ isDirty }),
  renderTheme: 'default',
  setRenderTheme: (renderTheme) => set({ renderTheme }),
  isLoaded: false,
  loadDraft: async () => {
    try {
      const draft = await loadDraft()
      if (draft) {
        set({ content: draft.content, filename: draft.filename, isLoaded: true })
      } else {
        set({ isLoaded: true })
      }
    } catch {
      set({ isLoaded: true })
    }
  },
}))

# 系统架构设计

## 1. 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                          用户界面层 (UI Layer)                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │   工具栏     │  │   编辑器     │  │       预览区             │ │
│  │  Toolbar     │  │ (CodeMirror) │  │     (Preview)            │ │
│  │ ├── 文件     │  │ ├── MD 源码  │  │ ├── 实时渲染 HTML        │ │
│  │ ├── 编辑     │  │ ├── 语法高亮 │  │ ├── 微信模拟容器         │ │
│  │ ├── 格式     │  │ ├── 自动补全 │  │ ├── 图表/Mermaid        │ │
│  │ ├── 插入     │  │ └── 错误提示 │  │ ├── KaTeX 公式          │ │
│  │ ├── 主题     │  │              │  │ └── 代码高亮             │ │
│  │ └── 帮助     │  │              │  │                          │ │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│                        核心渲染引擎 (Core Engine)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Markdown Parser (markdown-it)                                     │
│   ├── 基础语法 (GFM)                                                │
│   ├── 扩展插件体系                                                  │
│   │   ├── KaTeX 插件 (数学公式)                                     │
│   │   ├── Mermaid 插件 (流程图/时序图/类图/甘特图)                   │
│   │   ├── PlantUML 插件                                             │
│   │   ├── 脚注插件                                                   │
│   │   ├── 警告框插件 (GFM Alerts)                                    │
│   │   ├── TOC 目录插件                                               │
│   │   └── 自定义容器 ( :::tip :::warning )                            │
│   └── 后处理流水线                                                   │
│       ├── 图片处理器 (外链检测 / 上传替换 / 微信素材)                   │
│       ├── 样式注入器 (微信兼容 inline CSS)                            │
│       └── 代码高亮器 (Shiki → inline styles)                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        主题系统 (Theme System)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ├── 主题定义: 受控 Theme Token (字体/颜色/间距/边框/阴影)            │
│   ├── 主题渲染: CSS Variables 动态注入 → inline styles               │
│   ├── 预设主题: 10+ 微信公众号常用风格                                │
│   └── 自定义导入: JSON 优先，CSS 导入作为高级功能并经过白名单清理       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                      文档连接器层 (Connectors)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ├── Markdown 文件 (.md)    ->  直接读取                              │
│   ├── 导出包/剪贴板内容       ->  前端解析                              │
│   ├── 飞书云文档 (docx)      ->  后端代理 + block 结构转 Markdown/HTML  │
│   ├── Notion 页面            ->  后端代理 + Markdown Content API        │
│   └── 微信素材库             ->  未来扩展                              │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        发布/导出层 (Publish Layer)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ├── 复制到剪贴板 (Clipboard API - text/html MIME type)               │
│   ├── 下载为 HTML 文件                                               │
│   ├── 微信 MP Publish (需后端: 素材上传 + 草稿创建)                      │
│   └── AI Copilot (MCP / LangChain 接入 - 预留)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. 数据流

### 2.1 编辑 → 预览 数据流

```
用户输入 Markdown
    │
    ▼
┌─────────────┐
│ 编辑器状态  │ (Zustand / Jotai)
│ (debounced) │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ async render job │
│ markdown-it parse│
│ + 插件处理        │
│ + 自定义 renderer │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 微信兼容后处理    │
│ - 样式 inline 化  │
│ - 图片状态标记    │
│ - 代码高亮处理    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ RenderResult     │
│ - previewHtml    │
│ - clipboardHtml  │
│ - assets         │
│ - diagnostics    │
└──────────────────┘
```

### 2.2 导入飞书/Notion 数据流

```
用户粘贴飞书/Notion URL
    │
    ▼
┌─────────────────────┐
│ 前端校验 URL 格式    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────┐
│ 调用后端连接器 API   │────▶│ 后端调用飞书/     │
│ /api/connectors/*   │     │ Notion API       │
│                     │     │ + 图片搬运        │
└──────────┬──────────┘     └─────────┬────────┘
           │                          │
│ 返回 Markdown + 资源清单  │
           │◀─────────────────────────│
           │
           ▼
┌─────────────────────┐
│ 前端注入编辑器       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 图片资源处理         │
│ - 保留外链并提示风险 │
│ - 上传图床/微信素材  │
│ - 替换正文 URL       │
└─────────────────────┘
```

## 3. 关键设计原则

### 3.1 微信兼容性优先
- 所有样式必须使用 `style="..."` inline 形式
- 放弃 CSS class，微信编辑器会过滤 `<style>` 标签
- 外部图片不能默认依赖 Base64；稳定方案是上传到图床或微信素材库后替换 URL
- 表格必须带 `border` inline style

### 3.2 纯前端优先
- 核心渲染逻辑全部在浏览器端完成
- 后端仅用于：
  - API 代理（飞书/Notion token 代理，防止前端泄漏）
  - 图片搬运（下载临时资源、上传图床/微信素材库）
  - 微信发布（需要 appid/secret，必须后端）
- IndexedDB 存储草稿，无需用户登录即可使用

### 3.3 插件化设计
- Markdown 渲染引擎基于 `markdown-it` 插件体系
- 主题系统基于受控 Theme Token，可热插拔
- 数据源连接器基于统一接口 `DocumentConnector`

## 4. 状态管理

```typescript
// 核心状态树
interface AppState {
  // 编辑器
  editor: {
    activeTabId: string;
    tabs: Tab[];           // 多标签页
    content: string;        // 当前 Markdown 源码
    isDirty: boolean;       // 是否有未保存修改
    cursorPosition: { line: number; column: number };
    history: { undo: string[]; redo: string[] };
  };

  // 预览
  preview: {
    previewHtml: string;    // 页面内预览 HTML
    clipboardHtml: string;  // 复制给公众号的 HTML
    diagnostics: string[];  // 兼容性提示和渲染告警
    isRendering: boolean;   // 是否正在渲染
    renderError?: string;   // 渲染错误信息
  };

  // 主题
  theme: {
    activeThemeId: string;
    themes: Theme[];
    customTheme?: Theme;    // 用户自定义主题
  };

  // 设置
  settings: {
    editorFontSize: number;
    editorTheme: 'light' | 'dark';
    autoSave: boolean;
    autoSaveInterval: number; // ms
    syncScroll: boolean;     // 编辑器和预览同步滚动
    enableMermaid: boolean;
    enableKatex: boolean;
    enableFootnote: boolean;
  };

  // 导入
  import: {
    isImporting: boolean;
    source?: 'feishu' | 'notion' | 'file';
    progress?: { current: number; total: number };
  };
}
```

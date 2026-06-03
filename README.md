# md2wechat

> Markdown 编辑器，一键生成微信公众号兼容的排版 HTML。

**md2wechat** 是一个专为微信公众号文章排版设计的 Markdown 编辑工具。左侧编写 Markdown，右侧实时预览微信排版效果，支持代码高亮、数学公式、Mermaid 图表等丰富语法，导出 HTML 可直接粘贴到公众号编辑器。

## ✨ 功能特性

- 📝 **双栏编辑**：左侧 CodeMirror 编辑器，右侧 375px 手机预览
- 🎨 **四款主题**：默认、极简、科技风、优雅杂志，一键切换
- 🔧 **主题自定义**：字号、行高、颜色、间距实时调节
- 🔍 **字体缩放**：预览区支持 +/- 缩放，导出同步生效
- 💻 **代码高亮**：Shiki 驱动，支持 180+ 语言
- 📐 **数学公式**：KaTeX 渲染 LaTeX 公式
- 📊 **图表支持**：Mermaid 流程图 + PlantUML
- 📋 **一键导出**：复制 HTML / 下载 HTML 文件
- 💾 **草稿自动保存**：IndexedDB 自动保存，刷新不丢失
- 📥 **外部导入**：支持飞书/Notion 文档导入（建设中）
- 📱 **PWA**：支持离线使用

## 🚀 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

打开 http://localhost:5173 即可使用。

### 构建

```bash
pnpm build
```

构建产物分布在各包的 `dist/` 目录下。

### 类型检查

```bash
pnpm typecheck
```

## 📁 项目结构

```
md2wechat/
├── apps/
│   └── web/              # React + Vite 前端应用
├── packages/
│   ├── core/             # 核心渲染引擎（Markdown → 微信 HTML）
│   └── connectors/       # 外部文档源连接器（飞书、Notion）
├── server/               # Hono 后端 API（代理外部导入）
├── plans/                # 项目规划文档（已停止 Git 跟踪）
└── package.json          # pnpm workspace 根配置
```

这是一个 `pnpm workspace` 管理的 monorepo。

| 包名 | 路径 | 说明 |
|------|------|------|
| `@md2wechat/web` | `apps/web` | 编辑器 UI、预览、状态管理 |
| `@md2wechat/core` | `packages/core` | markdown-it 插件、主题系统、微信后处理管线 |
| `@md2wechat/connectors` | `packages/connectors` | 飞书/Notion URL 解析与 API 客户端 |
| `server` | `server` | Hono HTTP 服务，代理外部平台 API |

## 🛠 技术栈

- **前端框架**：React 19 + TypeScript 5.7
- **构建工具**：Vite 6
- **样式**：Tailwind CSS 3
- **状态管理**：Zustand
- **编辑器**：CodeMirror 6
- **Markdown 渲染**：markdown-it + 自定义插件
- **代码高亮**：Shiki
- **数学公式**：KaTeX
- **图表**：Mermaid（动态加载）、PlantUML（占位链接）
- **后端**：Hono
- **包管理**：pnpm workspace

## 🎯 核心设计

### 渲染管线

```
Markdown 输入
  → markdown-it.parse（基础 HTML）
  → processCodeBlocks（Shiki 高亮）
  → processImages（微信图片处理）
  → sanitizeForWechat（清理 class/style 标签）
  → inlineStyles（注入 Theme 内联样式）
  → 微信兼容 HTML
```

### 微信兼容性策略

- **Inline Style 优先**：所有主题 Token 转为内联 `style` 属性，避免微信不支持外部 CSS
- **Class 清理**：移除大部分 CSS class，保留 `.katex`、`.shiki` 等预览必需的 class
- **图片处理**：添加 `data-src` 等微信推荐属性
- **SVG/图表**：Mermaid 在预览区渲染为 SVG，导出时保留占位；PlantUML 提供外部链接

## 📝 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + B` | 加粗选中文字 |
| `Ctrl/Cmd + I` | 斜体选中文字 |
| `Ctrl/Cmd + K` | 插入链接 |
| `Ctrl/Cmd + 1~6` | 设为 H1~H6 标题 |
| `Ctrl/Cmd + S` | 保存文件 |
| `Ctrl/Cmd + O` | 打开文件 |

## 🔧 开发指南

### 添加新主题

在 `packages/core/src/theme/presets/` 中新增预设文件，导出 `Theme` 对象，然后在 `packages/core/src/theme/presets/index.ts` 和 `apps/web` 的主题选择器中注册。

### 修改渲染管线

核心渲染逻辑在 `packages/core/src/index.ts` 的 `renderToWechatHTML` 函数中。各处理阶段为独立函数，可自由组合或插入新阶段。

### 添加外部导入源

1. 在 `packages/connectors` 中实现 `BaseConnector` 接口
2. 在 `server/src/connectors/` 中添加对应的 API 路由
3. 在前端 `ImportDialog` 中注册新的导入选项

## 📄 License

MIT

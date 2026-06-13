# md2wechat

> Markdown 编辑器，一键生成微信公众号兼容的排版 HTML。

[![GitHub Pages部署状态](https://img.shields.io/github/deployments/zhuhong/md2wechat/github-pages?label=部署&style=flat-square)](https://zhuhong.github.io/md2wechat/)
[![在线体验](https://img.shields.io/badge/在线体验-zhuhong.github.io/md2wechat-blue?style=flat-square&logo=github)](https://zhuhong.github.io/md2wechat/)

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
- 📥 **外部导入**：支持飞书文档导入，Notion 入口暂为 mock
- 🧾 **飞书表格兼容**：自动将飞书返回的 HTML 表格转换为 Markdown 表格
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

`pnpm dev` 会同时启动：

| 服务 | 地址 | 说明 |
|------|------|------|
| Web | http://localhost:5173 | React + Vite 前端 |
| Server | http://localhost:3000 | Hono API 服务 |

也可以分别启动：

```bash
pnpm dev:web
pnpm dev:server
```

前端开发服务器会把 `/api` 请求代理到 `http://localhost:3000`。如需修改代理目标，可设置：

```bash
VITE_API_PROXY_TARGET=http://localhost:3000 pnpm dev:web
```

如果前端不是通过 Vite 开发服务器访问（例如静态构建产物、预览服务或部署环境），需要显式指定后端 API 地址：

```bash
VITE_API_BASE_URL=http://localhost:3000 pnpm dev:web
```

看到 `405 Not Allowed` 的 HTML 页面时，通常表示 `/api/connectors/resolve` 没有打到 md2wechat server。请确认 `pnpm dev:server` 已启动，并检查 `VITE_API_BASE_URL` 或 `/api` 代理配置。

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

## 📥 外部文档导入

### 飞书文档导入

飞书导入通过后端服务调用飞书开放平台 API。前端只负责提交文档 URL，实际鉴权和文档内容拉取在 `server` 内完成。

支持的 URL 形式：

```text
https://xxx.feishu.cn/docx/...
https://xxx.feishu.cn/docs/...
https://xxx.feishu.cn/wiki/...
```

配置环境变量，根目录 `.env` 和 `server/.env` 均可：

```bash
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
```

`server/.env` 的值会覆盖根目录 `.env`。服务端默认读取 `PORT=3000`，前端默认将 `/api` 代理到该端口。

飞书应用需要开通以下应用身份权限：

```text
docs:document.content:read
```

导入失败时，前端会展示飞书错误码、缺失权限、开通权限链接和原始错误。常见错误：

| 错误码 | 含义 | 处理方式 |
|--------|------|----------|
| `99991672` | 飞书应用缺少接口权限 | 在飞书开放平台为当前应用开通 `docs:document.content:read`，发布或生效应用后重试 |

飞书接口在 `content_type=markdown` 时仍可能返回 HTML 表格。服务端会在导入阶段将 `<table>` 转换为标准 Markdown 表格，再交给核心渲染器处理。

### Notion 导入

Notion 导入通过后端服务调用 Notion 公开 API，需要创建一个 Notion Integration 并将其接入目标页面。

支持的 URL 形式：

```text
https://www.notion.so/Page-Title-abc123def456...
https://notion.so/abc123def456...
```

配置环境变量：

```bash
NOTION_INTEGRATION_TOKEN=secret_xxx
```

**配置步骤：**

1. 访问 https://www.notion.so/my-integrations 创建一个新的 Integration
2. 复制 Internal Integration Token（以 `secret_` 开头）
3. 在目标 Notion 页面右上角 → 「...」→「Connect to」→ 选择刚创建的 Integration
4. 将 Token 填入 `.env` 或 `server/.env` 中

导入失败时，前端会展示原始错误信息。常见错误：

| 错误 | 原因 | 处理方式 |
|------|------|----------|
| `Missing NOTION_INTEGRATION_TOKEN` | 未配置 Integration Token | 按上方步骤配置 `.env` |
| `401 Unauthorized` | Token 无效或已失效 | 检查 Token 是否正确 |
| `404 Not Found` | 页面不存在或未接入 Integration | 在 Notion 页面中 Connect 对应 Integration |

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

1. 在 `packages/connectors/src` 中实现 `DocumentConnector` 接口
2. 在 `server/src/routes/connectors.ts` 中接入对应 source
3. 如需调用第三方 API，在 `server/src/services/` 中新增服务
4. 在前端 `apps/web/src/components/import/ImportDialog.tsx` 中注册新的导入选项
5. 在 `apps/web/src/hooks/useConnector.ts` 中补充调用和错误展示逻辑

## 📄 License

MIT

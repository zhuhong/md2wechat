# 技术选型

## 1. 前端技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | React | 19.x | 组件化，生态丰富 |
| **语言** | TypeScript | 5.7+ | 类型安全 |
| **构建** | Vite | 6.x | 快速，支持 HMR |
| **样式** | Tailwind CSS | 4.x | Utility-first |
| **UI 组件** | shadcn/ui | latest | 基于 Radix UI，可定制 |
| **图标** | Lucide React | latest | 现代图标库 |

> 版本号在初始化项目时按当时稳定版锁定，不建议在计划文档里长期依赖 `latest`。实际落地以 `package.json` 和 lockfile 为准。

## 2. 编辑器

| 候选 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| Monaco Editor | VS Code 内核，功能最全，生态强大 | 体积大，首屏加载压力高 | 功能需求高时 |
| **CodeMirror 6** | 轻量，可扩展性强，适合 Markdown 编辑器 | 配置需要自己组合 | ⭐ 推荐 MVP |
| SimpleMDE / EasyMDE | 即开即用 | 维护不活跃，功能有限 | ❌ 不推荐 |

**MVP 推荐：CodeMirror 6**
- 原因：这个产品的核心不是 IDE，而是 Markdown 编写、预览和复制；CodeMirror 的体积和可定制性更适合首屏体验。
- 如果后续确实需要更强的代码编辑体验，再切换或提供 Monaco 版本。

## 3. Markdown 渲染引擎

| 候选 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **markdown-it** | 插件生态最丰富，可定制 renderer | 需手动配置插件 | ⭐ 推荐 |
| marked | 轻量，速度快 | 插件生态弱 | 简单场景 |
| remark (unified) | 基于 AST，处理能力强 | 学习曲线陡 | 需要复杂 AST 操作时 |

**最终选择：markdown-it**
- 原因：微信渲染需要大量自定义 token renderer，markdown-it 最灵活
- 配套插件：
  - `markdown-it-attrs` - 自定义属性
  - `markdown-it-footnote` - 脚注
  - `markdown-it-task-lists` - 任务列表
  - `markdown-it-table-of-contents` - TOC
  - `markdown-it-container` - 自定义容器
  - `markdown-it-sub` / `markdown-it-sup` - 上下标
  - `markdown-it-mark` - 高亮
  - `markdown-it-deflist` - 定义列表

## 4. 代码高亮

| 候选 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **Shiki** | WebAssembly，支持 180+ 语言，精确 token，生成内联样式 | 首次加载需加载 wasm | ⭐ 推荐 |
| PrismJS | 轻量，浏览器端运行 | 语言支持有限，精度低 | ❌ 不推荐 |
| Highlight.js | 自动检测语言 | 样式依赖 CSS，无法 inline | ❌ 微信不兼容 |

**最终选择：Shiki**
- 原因：微信不支持外部 CSS，必须生成带 inline style 的 HTML
- Shiki 可以输出精确的 token + 颜色，完全内联

## 5. 数学公式

| 候选 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **KaTeX** | 速度快，支持大部分 LaTeX | 复杂公式可能不完全 | ⭐ 推荐 |
| MathJax | 功能最全 | 体积大，速度慢 | 需要全功能时 |

**最终选择：KaTeX**
- 原因：速度快，微信兼容性测试更充分
- 注意：需要引入 KaTeX CSS（或内联关键样式），或使用服务端预渲染

## 6. 图表渲染

| 类型 | 技术 | 说明 |
|------|------|------|
| 流程图/时序图/类图 | **Mermaid** 11 | 声明式图表，浏览器端渲染 SVG |
| UML | **PlantUML** | 需后端服务或调用 PlantUML 在线服务生成图片 |

**Mermaid 处理**：
- 浏览器端将 Mermaid 语法渲染为 SVG
- 预览区可内联 SVG；复制到公众号前需要兼容性测试，必要时转成图片并上传图床/微信素材
- 提供"下载为 SVG/PNG"功能

**PlantUML 处理**：
- 调用 `https://www.plantuml.com/plantuml/svg/...` 在线服务
- 或自建 PlantUML 服务（Docker: `plantuml/plantuml-server`）

## 7. 状态管理

| 候选 | 优点 | 缺点 | 建议 |
|------|------|------|------|
| **Zustand** | 极简，无样板代码，TypeScript 友好 | 生态不如 Redux | ⭐ 推荐 |
| Jotai | 原子化，按需订阅 | 概念需适应 | 大量独立状态时 |
| Redux Toolkit | 生态完善 | 样板代码多 | 超大型应用 |

**最终选择：Zustand**
- 原因：本项目状态相对集中，Zustand 足够简洁

## 8. 本地存储

| 候选 | 优点 | 建议 |
|------|------|------|
| **IndexedDB** | 容量大（~50MB+），支持结构化数据 | ⭐ 推荐（Dexie.js 封装） |
| localStorage | 简单 | 容量仅 ~5MB，仅适合配置 |

**选择：Dexie.js（IndexedDB wrapper）**
- 支持 Promise，API 简洁
- 支持数据库版本迁移

## 9. Monorepo 工具

| 候选 | 优点 | 建议 |
|------|------|------|
| **pnpm workspace** | 轻量，无需额外工具 | ⭐ 推荐（项目初期） |
| Turborepo | 缓存，管道 | 多包构建优化时引入 |

## 10. 后端技术栈（连接器阶段）

| 场景 | 技术 | 说明 |
|------|------|------|
| API 代理 | **Hono** | 轻量，支持 Cloudflare Workers/Vercel Edge |
| 图片搬运 | Hono + 对象存储/图床 API | 下载临时图片、上传并替换 URL |
| 微信 API | 微信官方 SDK | 素材上传、草稿发布 |
| 数据库 | SQLite / PostgreSQL | 用户配置存储 |
| 部署 | Vercel / Cloudflare Pages | 边缘部署，免费额度充足 |

## 11. React / Vue 选择

| 维度 | React 19 | Vue 3 |
|------|----------|----------------------|
| 编辑器生态 | CodeMirror/Monaco 都有成熟封装 | CodeMirror/Monaco 都有成熟封装 |
| 富文本渲染 | 组件生态丰富 | 组合式 API 清晰 |
| 现代 UI 体系 | shadcn/ui 极其丰富 | Naive UI/Arco |
| 开发者市场 | 招聘更容易 | - |
| 学习曲线 | JSX 对前端熟悉 | - |

建议沿用 React 是为了和当前计划里的 shadcn/ui、Zustand、Vite 组合一致。架构本身和框架无强绑定，如果团队 Vue 经验更强，Vue 3 也完全可行。

## 12. 依赖清单（核心）

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@codemirror/view": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/state": "^6.0.0",
    "markdown-it": "^14.1.0",
    "shiki": "^3.0.0",
    "katex": "^0.16.21",
    "mermaid": "^11.4.0",
    "zustand": "^5.0.0",
    "dexie": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@types/markdown-it": "^14.1.0",
    "@types/katex": "^0.16.7",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

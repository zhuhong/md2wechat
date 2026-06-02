# 架构 Review 与修订建议

## 1. 结论

现有方案可以作为方向，但需要把系统拆成三条相对独立的能力线：

1. **渲染器**：Markdown -> 预览 HTML -> 微信剪贴板 HTML。
2. **资源管线**：图片、Mermaid、KaTeX、代码高亮等资源的生成、上传、替换。
3. **文档连接器**：本地文件、飞书、Notion、公众号草稿箱等外部系统接入。

MVP 应该先把第一条能力线做扎实，否则后面的导入和发布都会把问题放大。

## 2. 对标 md.doocs.org 的功能面

首版建议复刻这些高价值功能：

- 左右分栏 Markdown 编辑和实时预览。
- 一键复制到公众号编辑器。
- 主题切换和少量可调样式。
- 标题、引用、列表、表格、代码块、图片的微信兼容样式。
- Mermaid、KaTeX、脚注、GFM Alerts 等 Markdown 扩展。
- 本地草稿保存和导入导出。

可以后置的功能：

- 多标签页。
- 完整主题市场。
- 微信草稿箱发布。
- AI 辅助排版。
- 飞书/Notion 自动导入。
- 多图床、CDN、公众号素材库管理。

## 3. 关键修订点

### 3.1 不要把 Base64 当成图片最终方案

Base64 适合本地预览和临时兜底，但不是稳定的公众号发布方案：

- 正文会急剧膨胀。
- 微信编辑器可能过滤或重新处理 data URL。
- 外部文档里的临时图片链接经常有鉴权和过期时间。

推荐路径：

1. MVP：保留图片原 URL，复制时给出图片风险提示。
2. v0.2：支持用户配置图床，把图片上传后替换 URL。
3. v0.3+：支持微信公众号素材上传，复制/发布前把图片替换为微信素材 URL。

### 3.2 渲染输出要分预览和剪贴板

同一份 Markdown 至少需要两个输出：

```typescript
interface RenderResult {
  previewHtml: string;      // 页面内预览，可保留交互和辅助 UI
  clipboardHtml: string;    // 粘贴到公众号的纯正文 HTML
  plainText: string;        // Clipboard text/plain fallback
  assets: RenderAsset[];    // 图片、图表、公式等资源清单
  diagnostics: Diagnostic[];// 警告、失败、兼容性提示
}
```

预览 HTML 可以包含按钮、图表下载入口和调试信息；剪贴板 HTML 必须干净，只保留微信公众号正文需要的节点和 inline style。

### 3.3 飞书和 Notion 需要后端连接器

飞书、Notion 都不应该在前端保存 token。

- **Notion**：可通过官方 API 获取页面 Markdown 内容，但需要 Integration Token 和页面授权。
- **飞书**：更适合作为块级文档解析任务，通过 docx block API 拉取结构，再转换为 Markdown/HTML；不能假设有稳定的“URL -> Markdown”前端直连能力。
- 两者的图片都可能是临时 URL，需要后端代取或上传到图床。

推荐统一接口：

```typescript
interface DocumentConnector {
  source: 'local' | 'feishu' | 'notion';
  resolve(input: string): Promise<ResolvedDocument>;
}

interface ResolvedDocument {
  title: string;
  markdown: string;
  assets: ExternalAsset[];
  warnings: string[];
}
```

### 3.4 主题系统先做 token，不要先做 CSS 导入

直接导入任意 CSS 会带来兼容和安全问题，也难以保证最终 inline 后的公众号效果。

建议先定义受控主题 token：

- 全局字体、字号、行高、正文色。
- h1-h6 样式。
- p、blockquote、ul/ol、table、code、img 样式。
- 主题色、强调色、边框色、背景色。

CSS 导入可以作为高级能力，但必须经过白名单解析和 sanitizer。

### 3.5 渲染器建议异步化

Shiki、Mermaid、KaTeX、图片探测都可能是异步工作。核心 API 不要设计成纯同步：

```typescript
async function renderMarkdown(input: RenderInput): Promise<RenderResult>
```

UI 层可以做 debounce、取消旧任务、显示 diagnostics。后续必要时再把渲染管线迁移到 Web Worker。

## 4. 推荐包结构

现有 monorepo 结构基本合理，但建议增加 `packages/connectors`，避免把外部 API 逻辑塞进纯渲染 core。

```text
apps/web                 # React Web 应用
packages/core            # Markdown 渲染、主题、微信兼容 HTML
packages/connectors      # 本地/飞书/Notion 文档连接器的共享类型和转换逻辑
server                   # API 代理、图片搬运、微信发布
```

`packages/core` 应保持无后端凭证、无特定 SaaS API token、无业务账户逻辑。

## 5. MVP 验收建议

MVP 不以“功能多”为准，而以“能真实粘贴到公众号”为准：

- 粘贴到微信公众号编辑器后，标题、段落、引用、表格、代码块样式保留。
- 复制内容不包含应用按钮、编辑器辅助节点或多余 wrapper。
- 图片复制前有清晰状态：可用、外链风险、需要上传。
- 至少 2 个主题通过同一套测试 Markdown 验收。
- 渲染错误不会清空用户正在编辑的内容。


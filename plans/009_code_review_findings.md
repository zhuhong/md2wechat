# 代码 Review Findings

Review 时间：2026-06-02

## 1. 总结

当前项目已经搭起了 web、core、connectors、server 四块，基础构建可以通过，但还有几类会直接影响真实使用的问题：

- 导入链路请求路径和响应结构不匹配。
- CodeMirror 编辑器没有同步外部 content 更新。
- Mermaid/PlantUML、KaTeX、mark 等扩展在 sanitizer/inline 之后失效。
- 复制 HTML 的 fallback 会退化成复制源码文本。
- core 包依赖浏览器 DOMParser，不适合直接在 Node 中使用。

建议优先修复导入链路、编辑器同步、图表/公式输出，再处理性能和 Node 兼容性。

## 2. Findings

### 2.1 High：外部导入接口当前基本不可用

相关文件：

- `apps/web/src/hooks/useConnector.ts`
- `packages/connectors/src/feishu.ts`
- `packages/connectors/src/notion.ts`
- `server/src/routes/connectors.ts`
- `apps/web/src/components/import/ImportDialog.tsx`

问题：

`useConnector.ts` 中 `API_BASE_URL = '/api'`，但 connector 内部又拼接 `/api/connectors/resolve`，实际请求会变成：

```text
/api/api/connectors/resolve
```

即使路径修正，server 返回的是：

```typescript
{ success: true, data: ResolvedDocument }
```

connector 却直接把 `response.json()` 当作 `ResolvedDocument` 返回。最终 `ImportDialog` 里读取 `result.markdown` 会得到 `undefined`。

建议：

1. 统一 API base URL 语义，`apiBaseUrl` 应传空字符串或 server origin，不要包含 `/api`。
2. connector 解析 `ApiResponse<ResolvedDocument>`，成功时返回 `data`，失败时抛出 `error`。
3. 给 `useConnector` 增加导入成功/失败的最小测试。

### 2.2 High：打开文件/导入文档后编辑器不会同步新内容

相关文件：

- `apps/web/src/components/editor/MarkdownEditor.tsx`
- `apps/web/src/components/toolbar/FileMenu.tsx`
- `apps/web/src/components/toolbar/Toolbar.tsx`

问题：

`FileMenu` 和 `ImportDialog` 成功后只更新 Zustand store 的 `content`。但 CodeMirror 只在初始化时读取一次 `useEditorStore.getState().content`，后续没有订阅 store 变化。

影响：

- 打开本地文件后，右侧预览可能更新，左侧编辑器仍显示旧内容。
- 导入飞书/Notion 后，编辑器仍是旧文档。
- 用户继续输入时，CodeMirror 会把旧文档内容重新写回 store，覆盖刚导入的内容。

建议：

1. 在 `MarkdownEditor` 中订阅 `content` 变化。
2. 当外部 content 与当前 editor doc 不一致时，用 transaction 替换编辑器内容。
3. 避免本地输入触发的 store 更新又反向重置光标，可增加 `lastSyncedContentRef` 或 action 来源标记。

### 2.3 High：Mermaid/PlantUML 预览和复制都会失效

相关文件：

- `packages/core/src/plugins/mermaid.ts`
- `packages/core/src/plugins/plantuml.ts`
- `packages/core/src/wechat/styleInliner.ts`
- `apps/web/src/components/preview/WechatPreview.tsx`
- `apps/web/src/components/toolbar/CopyButton.tsx`

问题：

Mermaid 插件输出：

```html
<div class="mermaid" data-diagram="...">...</div>
```

但 `inlineStyles` 会删除所有 `class`。预览层随后用 `.mermaid` 查询节点，已经查不到。

PlantUML 同样依赖 `.plantuml`，也会失效。此外 PlantUML URL 直接拼接原始源码，不是 PlantUML 标准压缩编码。

复制链路也有问题：`CopyButton` 复制 core 渲染结果，core 只输出占位节点，不包含 React 预览层渲染后的 SVG 或图片。

建议：

1. 不要依赖 class 查找图表节点，改用 `data-diagram-type="mermaid"` / `data-diagram-type="plantuml"`。
2. Mermaid 渲染应进入 core 的异步渲染管线，生成 `previewHtml` 和可复制的 `clipboardHtml`。
3. 复制到公众号前最好把 Mermaid SVG 转图片并上传，或者至少输出稳定 inline SVG 并做兼容验证。
4. PlantUML 需要按官方编码规则生成 URL，不能直接拼源码。

### 2.4 High：KaTeX 和 mark 在 sanitizer 后无法稳定保留

相关文件：

- `packages/core/src/plugins/katex.ts`
- `packages/core/src/plugins/mark.ts`
- `packages/core/src/wechat/styleInliner.ts`
- `packages/core/src/wechat/sanitizer.ts`

问题：

KaTeX `renderToString` 输出依赖：

- `class="katex..."`
- KaTeX CSS
- MathML 标签，例如 `math`、`semantics`、`mrow` 等

当前 `inlineStyles` 删除 class，`sanitizer` 又不允许 MathML 标签。结果公式排版会丢失或退化。

`markPlugin` 输出 `<mark>`，但 sanitizer 白名单没有 `mark`，所以高亮会被剥掉。

建议：

1. KaTeX 需要专门的 CSS inline 方案，或只保留 HTML output 并白名单必要标签/样式。
2. 如果公众号兼容性不好，公式应转 SVG/PNG 并作为 asset 处理。
3. sanitizer 增加 `mark`，并为 `mark` 添加 inline style。

### 2.5 Medium：Clipboard fallback 会复制 HTML 源码文本

相关文件：

- `apps/web/src/hooks/useClipboard.ts`
- `apps/web/src/components/toolbar/CopyButton.tsx`

问题：

现代路径使用 `ClipboardItem({ 'text/html': blob })`。一旦失败，fallback 会调用 `copyText(html)`，最终通过 textarea 复制 HTML 字符串。

影响：

在不支持 `ClipboardItem` 或非 secure context 的环境里，用户粘贴到公众号可能看到 HTML 源码，而不是富文本排版。

建议：

1. Clipboard API 写入时同时提供 `text/html` 和 `text/plain`。
2. fallback 使用隐藏 contenteditable 容器 + selection + `execCommand('copy')`，而不是 textarea。
3. 复制后给出成功模式提示：富文本复制成功 / 已复制 HTML 源码。

### 2.6 Medium：core 包依赖浏览器 DOMParser

相关文件：

- `packages/core/src/index.ts`

问题：

`renderMarkdown` 直接使用浏览器 `DOMParser`。在 Node 环境调用会报：

```text
ReferenceError: DOMParser is not defined
```

影响：

如果 core 未来要作为 npm 包、server 渲染器、CLI 或测试目标，这会阻断使用。

建议：

1. 明确 core 只支持浏览器，文档和 package 描述中写清楚。
2. 或引入可注入 DOM adapter，例如 `linkedom` / `happy-dom` / `jsdom`，让 Node 环境也能运行。
3. 为 `renderMarkdown` 增加 browser/node 两类测试。

### 2.7 Medium：构建产物偏大

相关文件：

- `packages/core/src/wechat/codeBlockProcessor.ts`
- `apps/web/src/components/preview/WechatPreview.tsx`
- `apps/web/package.json`

现象：

`pnpm --filter @md2wechat/web build` 可以通过，但产物较大：

- 主 chunk 约 `1.97 MB` minified。
- Shiki/Mermaid 拉出大量语言和图表相关 chunk。
- 构建输出有多个超过 `500 kB` 的 warning。

建议：

1. Shiki 只预加载常用语言，其他语言按需加载。
2. Mermaid 使用动态 import，只在文档包含 mermaid 代码块时加载。
3. 考虑把代码高亮和图表渲染放入 worker 或懒加载模块。

## 3. Verification

已执行：

```bash
pnpm --filter @md2wechat/web build
pnpm --filter @md2wechat/core typecheck
pnpm --filter @md2wechat/server typecheck
pnpm --filter @md2wechat/connectors build
```

结果：

- web build 当前通过。
- core typecheck 通过。
- server typecheck 通过。
- connectors build 通过。

额外验证：

```bash
node -e "import('@md2wechat/core').then(async m => { await m.renderMarkdown('# hi') })"
```

在 `apps/web` 下执行会报：

```text
ReferenceError: DOMParser is not defined
```

说明 core 目前依赖浏览器 DOM。

`pnpm --filter @md2wechat/server start` 在当前沙箱环境下因为监听 `0.0.0.0:3000` 被 `EPERM` 拦截，未作为代码缺陷判断。

## 4. 建议修复顺序

1. 修复导入接口：URL 拼接、ApiResponse 解包、错误处理。
2. 修复 CodeMirror 与 Zustand content 同步。
3. 修复 Mermaid/PlantUML 的占位节点识别和复制输出。
4. 修复 KaTeX / mark sanitizer 兼容。
5. 改进 Clipboard fallback。
6. 决定 core 是否支持 Node；若支持则引入 DOM adapter。
7. 优化 Shiki/Mermaid 的加载策略和 bundle size。


# 代码 Review Follow-up

Review 时间：2026-06-03

## 1. 当前状态

本轮复查基于 2026-06-03 的当前代码状态。上一轮 review 中的部分问题已经修复：

- connector 请求路径和 `ApiResponse` 解包已经修复。
- CodeMirror 已能同步外部 `content` 更新。
- Clipboard fallback 已从 textarea 改为 hidden `contenteditable`，现代 Clipboard API 也同时写入 `text/html` 和 `text/plain`。
- `@md2wechat/core` 的浏览器 DOM 依赖已经在 README 中说明。

当前构建和类型检查结果：

```bash
pnpm --filter @md2wechat/web build
pnpm --filter @md2wechat/core typecheck
pnpm --filter @md2wechat/connectors typecheck
pnpm --filter @md2wechat/server typecheck
```

结果均通过。

## 2. Remaining Findings

### 2.1 High：Mermaid / PlantUML 仍然无法可靠预览和复制

相关文件：

- `packages/core/src/plugins/mermaid.ts`
- `packages/core/src/plugins/plantuml.ts`
- `packages/core/src/wechat/styleInliner.ts`
- `apps/web/src/components/preview/WechatPreview.tsx`
- `apps/web/src/components/toolbar/CopyButton.tsx`
- `apps/web/src/components/toolbar/DownloadButton.tsx`

问题：

Mermaid 和 PlantUML 插件输出：

```html
<div class="mermaid" data-diagram="...">...</div>
<div class="plantuml" data-diagram="...">...</div>
```

但 `styleInliner` 会删除 `div` 上的 `class`。随后 `WechatPreview` 使用：

```typescript
articleRef.current.querySelectorAll<HTMLDivElement>('.mermaid')
articleRef.current.querySelectorAll<HTMLDivElement>('.plantuml')
```

查询节点，实际已经查不到，因此图表不会渲染。

另外，复制和下载走的是 core 渲染输出，只包含占位节点，不包含 React 预览层渲染后的 SVG 或图片。

解决方案：

1. 占位节点改用稳定 data attribute，而不是 class：

```html
<div data-diagram-type="mermaid" data-diagram="...">...</div>
<div data-diagram-type="plantuml" data-diagram="...">...</div>
```

2. `WechatPreview` 改为：

```typescript
querySelectorAll('[data-diagram-type="mermaid"]')
querySelectorAll('[data-diagram-type="plantuml"]')
```

3. 更彻底的方案是把图表渲染移入 core 的 async render pipeline：

```typescript
renderMarkdown(markdown): Promise<RenderResult>
```

其中 `previewHtml` 可包含 SVG，`clipboardHtml` 应包含微信兼容输出。

4. PlantUML 不能直接把源码拼到 URL，需要按 PlantUML 官方规则压缩编码。否则链接大概率不可用。

5. 公众号复制前建议把 Mermaid/PlantUML 输出转为图片并进入 asset 管线，后续再上传到图床或微信素材。

优先级：

先修 data attribute 让预览可用，再处理复制/下载的图表输出。

### 2.2 High：复制和下载忽略当前选择的排版主题

相关文件：

- `apps/web/src/components/preview/WechatPreview.tsx`
- `apps/web/src/components/toolbar/CopyButton.tsx`
- `apps/web/src/components/toolbar/DownloadButton.tsx`

问题：

预览中使用了当前主题：

```typescript
const { content, renderTheme } = useEditorStore()
const { html, loading } = useMarkdownParser(content, renderTheme)
```

但复制和下载没有传 `renderTheme`：

```typescript
useMarkdownParser(content)
```

影响：

用户在右侧看到的是已选主题，但复制到公众号或下载 HTML 时会变回默认主题。这个会直接破坏“所见即所得”的核心体验。

解决方案：

在 `CopyButton` 和 `DownloadButton` 中读取 `renderTheme` 并传入 `useMarkdownParser`：

```typescript
const { content, renderTheme } = useEditorStore()
const { html, loading } = useMarkdownParser(content, renderTheme)
```

进一步建议：

不要让预览、复制、下载各自独立调用 `useMarkdownParser`。可以把 `RenderResult` 放进统一 store 或上提到 layout 层，避免同一 Markdown 被重复渲染三次，也避免不同入口参数不一致。

### 2.3 Medium：KaTeX 仍缺少微信兼容的样式方案

相关文件：

- `packages/core/src/plugins/katex.ts`
- `packages/core/src/wechat/styleInliner.ts`
- `packages/core/src/wechat/sanitizer.ts`

问题：

当前 sanitizer 已经加入了部分 MathML/SVG 相关标签，`styleInliner` 也保留了部分 math/svg 元素 class。但 KaTeX 主要布局依赖大量 `span` class，例如 `katex`、`katex-html`、`mord`、`mspace` 等。

当前 `styleInliner` 会删除普通 `span` 上的 class，因此 KaTeX 的 HTML 输出仍然缺少样式来源。只保留标签和少量 class 不等于在微信公众号中能保留公式排版。

解决方案：

可选路径：

1. **CSS inline 路径**：
   - 引入 KaTeX CSS。
   - 在 core 中针对 KaTeX 输出做 CSS inline。
   - sanitizer 白名单保留必要标签和必要属性。

2. **图片/SVG 路径**：
   - 将公式渲染为 SVG 或 PNG。
   - 作为 `Asset` 进入资源管线。
   - 复制/发布前上传并替换 URL。

3. **MVP 降级路径**：
   - 在 diagnostics 中明确提示“公式在公众号中可能无法保留完整样式”。
   - 暂时禁用“公式已完整支持”的产品表述。

建议优先级：

如果目标是微信公众号稳定粘贴，优先考虑公式转 SVG/PNG 或图片 asset。CSS inline 需要更多兼容性验证。

### 2.4 Medium：主题自定义面板目前不影响实际输出

相关文件：

- `apps/web/src/components/theme/ThemePanel.tsx`
- `apps/web/src/stores/customThemeStore.ts`
- `apps/web/src/hooks/useMarkdownParser.ts`
- `packages/core/src/theme/renderer.ts`

问题：

`ThemePanel` 可以修改：

- 字体大小
- 行高
- 正文颜色
- 链接颜色
- 代码颜色
- 段落间距
- 标题间距

这些值写入 `useCustomThemeStore` 的 `overrides`，但项目中没有其他地方读取这些 overrides。实际预览、复制、下载不会受到影响。

影响：

用户会认为自己已经调整主题，但文章输出没有变化。

解决方案：

1. 在 web 层根据 `renderTheme + overrides` 生成实际 Theme：

```typescript
const theme = mergeThemePresetWithOverrides(baseTheme, overrides)
```

2. 扩展 core API，让 `renderMarkdown` 支持传入 `Theme` 对象，而不仅是 theme id：

```typescript
renderMarkdown(markdown, {
  theme: customTheme
})
```

或者增加单独字段：

```typescript
renderMarkdown(markdown, {
  themeId: 'default',
  themeOverrides
})
```

3. `useMarkdownParser` 的依赖应包含 overrides，保证调整滑块时实时重渲染。

4. 复制和下载也必须使用同一套 merged theme。

建议：

优先实现少量明确 token，例如 paragraph、heading、link、code，再扩展完整主题编辑器。

### 2.5 Medium：Service Worker 可能导致旧版本页面缓存

相关文件：

- `apps/web/src/utils/registerSW.ts`
- `apps/web/public/sw.js`

问题：

`sw.js` 使用固定 cache name：

```javascript
const CACHE_NAME = 'md2wechat-v1';
```

并且对 `/` 和 `/index.html` 使用 cache-first：

```javascript
caches.match(event.request).then((cached) => cached || fetch(event.request))
```

影响：

部署新版本后，用户可能继续拿到旧的 `index.html`。如果旧 index 指向旧 hash 资源，而资源已经被清理，就会出现白屏或加载失败。

解决方案：

1. 对 HTML 使用 network-first：

```javascript
if (event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')))
}
```

2. 只对 hashed static assets 使用 cache-first。

3. 每次构建自动注入版本号，而不是手动维护 `md2wechat-v1`。

4. 增加 activate 阶段清理旧 cache：

```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  )
})
```

### 2.6 Low / Perf：Bundle size 仍然偏大

相关文件：

- `apps/web/vite.config.ts`
- `apps/web/src/components/preview/WechatPreview.tsx`
- `packages/core/src/wechat/codeBlockProcessor.ts`

当前构建通过，但主要 chunk 偏大：

- `mermaid` 约 2.9 MB minified。
- `shiki` 约 773 KB minified。
- `codemirror` 约 532 KB minified。

`manualChunks` 只是改善缓存和分包，不会降低首次需要加载的功能体积。由于 `WechatPreview` 顶层 import Mermaid，Mermaid 仍然会进入应用加载路径。

解决方案：

1. Mermaid 动态加载：

```typescript
if (html.includes('data-diagram-type="mermaid"')) {
  const mermaid = await import('mermaid')
}
```

2. Shiki 延迟初始化，仅在文档包含代码块时加载。

3. Shiki 语言集合进一步收窄，未知语言走 fallback。

4. 未来可把图表和代码高亮放到 Web Worker，避免阻塞主线程。

## 3. 已修复项记录

### 3.1 Connector 请求路径和响应解包

当前状态：

- `API_BASE_URL` 已改为 `''`。
- `FeishuConnector` / `NotionConnector` 已新增 `parseResponse`，正确解包 `{ success, data }`。

剩余注意：

server 当前仍是 mock，不是真实飞书/Notion API。

### 3.2 CodeMirror 同步外部 content

当前状态：

`MarkdownEditor` 已监听 `content` 变化，并在内容不一致时替换 editor doc。

剩余注意：

外部同步会触发 CodeMirror update listener，再调用一次 `setContent` 和 `saveDraft`。目前影响不大，但后续可通过 transaction annotation 区分 external sync 和 user edit，减少重复保存。

### 3.3 Clipboard fallback

当前状态：

- 现代 Clipboard API 同时写入 `text/html` 和 `text/plain`。
- fallback 改为 hidden `contenteditable`，不再用 textarea 复制 HTML 源码。

### 3.4 core 浏览器环境限制

当前状态：

`packages/core/README.md` 已说明 `DOMParser` 依赖浏览器环境。如果未来要支持 Node 渲染，需要注入 DOM adapter。

## 4. 建议修复顺序

1. 修复复制/下载忽略主题的问题，成本低、影响大。
2. 修复 Mermaid/PlantUML 的 class 依赖，至少让预览可用。
3. 明确图表复制/下载策略：占位、SVG、图片 asset 三选一，不要让预览和复制不一致。
4. 让主题自定义 overrides 进入实际 render pipeline。
5. 处理 KaTeX：要么 inline CSS，要么转 SVG/图片，要么降级提示。
6. 调整 Service Worker 缓存策略，避免线上版本更新问题。
7. 动态加载 Mermaid/Shiki，降低首屏负担。


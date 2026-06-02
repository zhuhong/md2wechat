# 核心模块详解

## 1. Markdown 渲染引擎

### 1.1 架构

```typescript
// packages/core/src/parser.ts
import MarkdownIt from 'markdown-it';
import katexPlugin from './plugins/katex';
import mermaidPlugin from './plugins/mermaid';
import footnotePlugin from 'markdown-it-footnote';
import containerPlugin from 'markdown-it-container';

export function createParser(options: ParserOptions) {
  const md = new MarkdownIt({
    html: false,        // 禁用原始 HTML，安全
    xhtmlOut: true,     // 自闭合标签
    breaks: true,       // 换行转 <br>
    linkify: true,      // 自动识别链接
    typographer: true,  // 智能标点
  });

  // 插件加载顺序很重要
  if (options.enableKatex) {
    md.use(katexPlugin);
  }
  if (options.enableFootnote) {
    md.use(footnotePlugin);
  }
  md.use(containerPlugin, 'tip');
  md.use(containerPlugin, 'warning');
  md.use(containerPlugin, 'danger');
  // ... 更多插件

  // 自定义 renderer 覆盖
  md.renderer.rules.table_open = () => '<table style="border-collapse: collapse; width: 100%;">';
  md.renderer.rules.th_open = () => '<th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">';
  md.renderer.rules.td_open = () => '<td style="border: 1px solid #ddd; padding: 8px;">';

  return md;
}
```

### 1.2 微信兼容后处理器

```typescript
// packages/core/src/wechat.ts
export function postProcessForWechat(html: string, options: WechatOptions): RenderResult {
  const dom = new DOMParser().parseFromString(html, 'text/html');

  // 1. 应用主题 token 到 inline style
  applyThemeInlineStyles(dom, options.theme);

  // 2. 处理图片
  const assets = collectAndMarkImages(dom, options.imageMode);

  // 3. 处理代码块（确保 background-color inline）
  processCodeBlocks(dom);

  // 4. 移除不允许的标签
  sanitizeForWechat(dom);

  // 5. 返回预览/剪贴板双输出
  return {
    previewHtml: buildPreviewHtml(dom, assets),
    clipboardHtml: dom.body.innerHTML,
    plainText: dom.body.textContent ?? '',
    assets,
    diagnostics: buildDiagnostics(assets),
  };
}
```

### 1.3 KaTeX 插件

```typescript
// 在 markdown-it token 渲染时，将 $...$ 和 $$...$$ 替换为 KaTeX HTML
// 注意：KaTeX CSS 需要内联或预加载关键样式
// 方案 A: 使用 katex.renderToString() 生成 HTML（不含 CSS）
// 方案 B: 提取 KaTeX 关键 CSS 并内联到每个公式
```

### 1.4 Mermaid 插件

```typescript
// 渲染管线：
// 1. markdown-it 将 ```mermaid 识别为 code block
// 2. 自定义 renderer 将内容提取，用 mermaid.render() 转为 SVG
// 3. 将 SVG 直接嵌入 HTML（微信支持内联 SVG）
// 4. 提供交互按钮：下载 SVG / 下载 PNG

// 注意：Mermaid 11 支持 Web Worker 渲染，不阻塞主线程
```

## 2. 主题系统

### 2.1 主题 Schema

```typescript
// packages/core/src/theme/types.ts
export interface Theme {
  id: string;
  name: string;
  author?: string;
  description?: string;

  // 全局样式
  body: {
    fontFamily: string;
    fontSize: string;
    lineHeight: number;
    color: string;
    backgroundColor: string;
    padding: string;
    maxWidth: string;
  };

  // 标题
  headings: {
    h1: HeadingStyle;
    h2: HeadingStyle;
    h3: HeadingStyle;
    h4: HeadingStyle;
    h5: HeadingStyle;
    h6: HeadingStyle;
  };

  // 段落
  paragraph: TextStyle;

  // 引用块
  blockquote: {
    borderLeft: string;
    paddingLeft: string;
    color: string;
    backgroundColor?: string;
    fontStyle?: 'normal' | 'italic';
  };

  // 代码
  code: {
    inline: CodeStyle;
    block: CodeBlockStyle;
  };

  // 表格
  table: TableStyle;

  // 链接
  link: LinkStyle;

  // 图片
  image: ImageStyle;

  // 分割线
  hr: HRStyle;

  // 列表
  list: ListStyle;
}

export interface HeadingStyle extends TextStyle {
  textAlign?: 'left' | 'center' | 'right';
  borderBottom?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface TextStyle {
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: string;
}
```

### 2.2 主题渲染器

```typescript
// packages/core/src/theme/renderer.ts
export function renderThemeToInlineCSS(theme: Theme, element: string): string {
  // 将 Theme 对象转换为指定 HTML 元素的 inline style 字符串
  // 例如：
  // renderThemeToInlineCSS(theme, 'h1') 
  // -> 'font-size: 24px; font-weight: 700; color: #333; margin-top: 1.5em; ...'
}

export function applyThemeToHTML(html: string, theme: Theme): string {
  // 解析 HTML，为每个元素添加对应的 inline style
  // 1. 用 DOMParser 解析
  // 2. 遍历节点，根据标签名匹配 theme 中的样式
  // 3. 将样式写入 style 属性
  // 4. 返回序列化后的 HTML
}
```

### 2.3 预设主题示例

```typescript
// packages/core/src/theme/presets/default.ts
export const defaultTheme: Theme = {
  id: 'default',
  name: '默认主题',
  body: {
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontSize: '16px',
    lineHeight: 1.75,
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: '1em',
    maxWidth: '677px',  // 微信正文宽度
  },
  headings: {
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#333',
      textAlign: 'center',
      marginTop: '1.5em',
      marginBottom: '0.5em',
    },
    // ... h2-h6
  },
  // ... 其他样式
};
```

## 3. 图片处理器

### 3.1 处理流程

```typescript
// packages/core/src/wechat/imageProcessor.ts

export async function processImages(
  dom: Document,
  mode: 'keep-url' | 'upload' | 'placeholder'
): Promise<void> {
  const images = dom.querySelectorAll('img');

  for (const img of images) {
    const src = img.getAttribute('src');
    if (!src) continue;

    if (src.startsWith('http')) {
      // 外部图片
      if (mode === 'upload') {
        // 通过后端上传到图床或微信素材库，再替换 URL。
        // MVP 可以先保留原 URL，并在 diagnostics 中提示风险。
      } else if (mode === 'placeholder') {
        img.setAttribute('src', 'data:image/svg+xml,...placeholder...');
        img.setAttribute('data-original-src', src);
      }
    }

    // 强制 inline 样式：max-width: 100%
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'block';
    img.style.margin = '0 auto';
  }
}

// Base64 只作为预览或降级手段，不作为公众号粘贴/发布的默认路径。
```

## 4. 代码高亮处理器

### 4.1 Shiki 集成

```typescript
// packages/core/src/wechat/codeHighlighter.ts
import { createHighlighter } from 'shiki';

let highlighter: Highlighter | null = null;

export async function initHighlighter() {
  highlighter = await createHighlighter({
    themes: ['github-light'],
    langs: ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'html', 'css', 'bash', 'json', 'yaml', 'markdown', 'sql'],
  });
}

export function highlightCode(code: string, lang: string): string {
  if (!highlighter) return `<pre><code>${escapeHtml(code)}</code></pre>`;

  // Shiki 生成带 inline styles 的 HTML（微信兼容）
  return highlighter.codeToHtml(code, {
    lang,
    theme: 'github-light',
    // 关键：不使用 CSS class，全部内联
    // Shiki 默认输出内联样式 ✓
  });
}
```

### 4.2 微信兼容处理

```typescript
// 为代码块添加微信兼容样式
export function styleCodeBlockForWechat(html: string): string {
  // 1. Shiki 输出的 HTML 已经是 inline style（✓）
  // 2. 为 <pre> 添加背景色和圆角
  // 3. 为 <pre> 添加 overflow-x: auto 或 word-wrap
  // 4. 移除 font-family: ... 中的等宽字体（微信编辑器可能不支持）
}
```

## 5. 文档连接器

### 5.1 统一接口

```typescript
// packages/connectors/src/types.ts

export interface DocumentConnector {
  readonly source: 'local' | 'feishu' | 'notion';
  validateInput(input: string): { valid: boolean; error?: string };
  resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument>;
}

export interface ResolvedDocument {
  source: 'local' | 'feishu' | 'notion';
  title: string;
  markdown: string;
  assets: ExternalAsset[];
  warnings: string[];
  metadata?: Record<string, unknown>;
}

export interface ExternalAsset {
  id: string;
  type: 'image' | 'file';
  originalUrl: string;
  filename?: string;
  mimeType?: string;
  requiresAuth: boolean;
  expiresAt?: string;
}

export interface ConnectorConfig {
  token?: string;       // 临时访问令牌，只传给后端，不在前端持久化
  apiBaseUrl?: string;
}
```

### 5.2 飞书连接器

```typescript
// packages/connectors/src/feishu.ts

export class FeishuConnector implements DocumentConnector {
  readonly source = 'feishu' as const;
  private readonly urlPattern = /https?:\/\/\w+\.feishu\.cn\/(?:docs|docx|wiki)\/([a-zA-Z0-9]+)/;

  validateInput(input: string) {
    if (!this.urlPattern.test(input)) {
      return { valid: false, error: '请输入有效的飞书文档 URL' };
    }
    return { valid: true };
  }

  async resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument> {
    const match = input.match(this.urlPattern);
    if (!match) throw new Error('Invalid URL');

    const token = match[1];
    const type = input.includes('/wiki/') ? 'wiki' : 'docx';

    // 后端负责调用飞书 block API、处理鉴权和资源下载。
    const response = await fetch(`${config?.apiBaseUrl ?? ''}/api/connectors/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'feishu', input, token: config?.token, meta: { token, type } }),
    });

    return response.json();
  }
}
```

### 5.3 Notion 连接器

```typescript
// packages/connectors/src/notion.ts

export class NotionConnector implements DocumentConnector {
  readonly source = 'notion' as const;

  validateInput(input: string) {
    if (!extractNotionPageId(input)) {
      return { valid: false, error: '请输入有效的 Notion 页面 URL 或 Page ID' };
    }
    return { valid: true };
  }

  async resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument> {
    const pageId = extractNotionPageId(input);
    if (!pageId) throw new Error('Invalid Notion page id');

    // 后端负责携带 Integration Token 调用 Notion Markdown Content API。
    const response = await fetch(`${config?.apiBaseUrl ?? ''}/api/connectors/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'notion', input, token: config?.token, meta: { pageId } }),
    });

    return response.json();
  }
}

function extractNotionPageId(input: string): string | null {
  const normalized = input.replace(/-/g, '');
  return normalized.match(/[a-f0-9]{32}/i)?.[0] ?? null;
}
```

## 6. 复制/发布模块

### 6.1 复制到剪贴板

```typescript
// packages/core/src/publish/clipboard.ts

export async function copyToClipboard(html: string): Promise<boolean> {
  try {
    // 方案 A: Clipboard API (现代浏览器)
    if (navigator.clipboard && ClipboardItem) {
      const blob = new Blob([html], { type: 'text/html' });
      const plainText = stripHtml(html);
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      const item = new ClipboardItem({
        'text/html': blob,
        'text/plain': textBlob,
      });
      
      await navigator.clipboard.write([item]);
      return true;
    }

    // 方案 B: document.execCommand (兼容性回退)
    const textarea = document.createElement('textarea');
    textarea.value = html;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
```

### 6.2 微信发布（需后端）

```typescript
// 预留接口，需要后端服务
// 1. 获取 access_token（后端用 appid/secret）
// 2. 上传图文素材（图片先上传到微信素材库）
// 3. 创建草稿（draft）
// 4. 返回微信编辑器链接
```

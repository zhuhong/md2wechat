# @md2wechat/core

Core rendering engine for md2wechat — Markdown to WeChat-compatible HTML.

## ⚠️ Environment Requirement

This package uses `DOMParser` and browser-only APIs for WeChat HTML post-processing. **It must run in a browser environment.**

If you need server-side / Node.js rendering, inject a DOM adapter (e.g. `linkedom`, `jsdom`) before calling `renderMarkdown`:

```typescript
import { DOMParser } from 'linkedom';
globalThis.DOMParser = DOMParser;

import { renderMarkdown } from '@md2wechat/core';
const result = await renderMarkdown('# Hello');
```

## API

### `renderToWechatHTML(markdown, options?)`

Primary API for the web app. Returns a WeChat-compatible HTML string.

```typescript
import { renderToWechatHTML } from '@md2wechat/core';

const html = await renderToWechatHTML('# Hello', { theme: 'default' });
```

### `renderMarkdown(markdown, options?)`

Full renderer returning complete output:

```typescript
interface RenderResult {
  previewHtml: string;      // For in-app preview
  clipboardHtml: string;    // For WeChat editor paste
  plainText: string;        // Fallback text
  assets: Asset[];          // Image/resource inventory
  diagnostics: Diagnostic[];// Warnings & errors
}
```

## Themes

Built-in themes: `default`, `minimal`, `tech`, `elegant`.

```typescript
import { defaultTheme, minimalTheme } from '@md2wechat/core/themes';
```

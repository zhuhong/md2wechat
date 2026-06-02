# 飞书/Notion 连接器方案

## 1. 设计目标

外部文档导入不是纯前端功能。连接器需要完成四件事：

1. 解析用户输入的文档 URL 或页面 ID。
2. 通过后端代理调用飞书/Notion API，避免 token 暴露到浏览器。
3. 把外部文档结构转换为 Markdown 或可控 HTML。
4. 提取图片、附件、图表等资源，交给资源管线上传和替换 URL。

统一返回结构：

```typescript
export interface ResolvedDocument {
  source: 'feishu' | 'notion' | 'local';
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
```

## 2. 飞书导入

### 2.1 推荐路径

飞书新版云文档适合按 block tree 解析：

1. 从 URL 提取 `docx` 或 `wiki` token。
2. 如果是 wiki URL，先解析到真实节点/文档 token。
3. 后端使用飞书应用凭证或用户授权获取访问 token。
4. 调用飞书 docx block API 获取文档块结构。
5. 将 block 转换为 Markdown：
   - heading -> `#`
   - text -> paragraph
   - bullet/ordered list -> Markdown list
   - table -> GFM table 或 HTML table
   - image -> `![alt](asset://id)`，并写入 `assets`
   - mention/date/file/card -> 普通文本、链接或 warning

### 2.2 URL 解析

```typescript
export function extractFeishuToken(input: string): {
  type: 'docx' | 'wiki';
  token: string;
} | null {
  const match = input.match(/feishu\.cn\/(?:docs|docx|wiki)\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const type = input.includes('/wiki/') ? 'wiki' : 'docx';
  return { type, token: match[1] };
}
```

### 2.3 权限策略

首版不要让用户在前端长期保存 token。

可选方案：

- 服务端配置企业自建应用，只导入当前团队有权限的文档。
- 用户临时粘贴 access token，后端只转发不落库。
- 后续接入 OAuth，让用户授权后导入自己的文档。

### 2.4 图片策略

飞书图片经常需要鉴权或有有效期。不要把图片直接转成 Base64 作为最终正文。

推荐流程：

```text
asset://id
  -> 后端带 token 下载
  -> 上传到图床或微信公众号素材库
  -> 返回稳定 URL
  -> 替换 Markdown/HTML 中的 asset://id
```

## 3. Notion 导入

### 3.1 推荐路径

Notion 可以优先使用官方 Markdown Content API 获取页面 Markdown。该 API 仍需要 Integration Token，并且页面必须共享给对应 integration。

流程：

1. 从 URL 提取 page id。
2. 后端携带 Integration Token 请求 Notion。
3. 获取 Enhanced Markdown。
4. 清理 Notion 特有语法，提取图片资源。
5. 返回 `ResolvedDocument`。

如果 Markdown Content API 的输出不满足控制要求，再用 Block API 作为 fallback，递归遍历 block tree 自行转换。

### 3.2 Page ID 解析

```typescript
export function extractNotionPageId(input: string): string | null {
  const normalized = input.replace(/-/g, '');
  const match = normalized.match(/[a-f0-9]{32}/i);
  return match?.[0] ?? null;
}
```

### 3.3 Markdown 清理

Notion Enhanced Markdown 可能包含 callout、toggle、mention、bookmark、equation 等结构。清理策略应保守：

- callout -> GFM Alert 或 blockquote。
- toggle -> 普通标题 + 内容，或 warning 提示交互丢失。
- mention page/database -> 普通链接。
- equation -> KaTeX 语法。
- unsupported block -> 保留原始文本并写入 `warnings`。

## 4. 后端 API

建议用一个统一入口，减少前端分支：

```typescript
POST /api/connectors/resolve

type ResolveRequest = {
  source: 'feishu' | 'notion';
  input: string;
  token?: string;
};

type ResolveResponse = ResolvedDocument;
```

图片搬运单独做 API：

```typescript
POST /api/assets/upload

type UploadAssetRequest = {
  source: 'feishu' | 'notion' | 'external';
  assets: ExternalAsset[];
  target: 'image-host' | 'wechat-material';
};
```

## 5. MVP 降级方案

在自动导入 API 做好前，先支持更容易落地的路径：

- 粘贴 Markdown。
- 打开本地 `.md` 文件。
- 导入 Notion/飞书手动导出的 Markdown 或 HTML 文件。
- 粘贴富文本后尝试转换为 Markdown。

这能覆盖早期真实使用，同时不阻塞核心渲染器交付。

## 6. 验收标准

- token 不出现在浏览器 localStorage、IndexedDB 或 URL 中。
- 导入失败时不会覆盖当前编辑器内容。
- 所有外部图片都进入 `assets` 清单，并显示可用/需上传/失败状态。
- 不支持的块不会静默丢失，必须进入 `warnings`。
- 导入后的 Markdown 可以继续走同一套 `renderMarkdown` 管线。


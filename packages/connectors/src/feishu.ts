import type { DocumentConnector, ResolvedDocument, ConnectorConfig } from './types.js';

async function parseResponse<T>(response: Response): Promise<T> {
  const json = await response.json() as { success: boolean; data?: T; error?: string; code?: string };
  if (!json.success) {
    throw new Error(json.error || `Request failed: ${json.code}`);
  }
  if (json.data === undefined) {
    throw new Error('Invalid response: missing data');
  }
  return json.data;
}

async function readErrorMessage(response: Response): Promise<string> {
  const text = await response.text().catch(() => '');
  if (!text) {
    return response.statusText || `HTTP ${response.status}`;
  }

  try {
    const json = JSON.parse(text) as { error?: string; code?: string };
    if (json.error) return json.error;
    if (json.code) return `Request failed: ${json.code}`;
  } catch {
    if (looksLikeHtml(text, response)) {
      const htmlTitle = extractHtmlTitle(text);
      const status = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;

      if (response.status === 405) {
        return `API 请求没有到达 md2wechat 后端服务（${status}${htmlTitle ? `，页面提示：${htmlTitle}` : ''}）。请确认 server 已启动，并检查 VITE_API_BASE_URL 或 Vite /api 代理配置。`;
      }

      return `API 服务返回了 HTML 页面（${status}${htmlTitle ? `，页面提示：${htmlTitle}` : ''}），请检查前端 API 地址是否指向 md2wechat server。`;
    }

    return text;
  }

  return response.statusText || `HTTP ${response.status}`;
}

function looksLikeHtml(text: string, response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  return contentType.includes('text/html') || /^\s*(?:<!doctype\s+html|<html)\b/i.test(text);
}

function extractHtmlTitle(text: string): string | undefined {
  const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?? text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];

  return title
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export class FeishuConnector implements DocumentConnector {
  readonly source = 'feishu' as const;

  private readonly urlPattern = /https?:\/\/[^/]+\.feishu\.cn\/(?:docs|docx|wiki)\/([a-zA-Z0-9]+)/;

  validateInput(input: string): { valid: boolean; error?: string } {
    if (!this.urlPattern.test(input)) {
      return { valid: false, error: '请输入有效的飞书文档 URL' };
    }
    return { valid: true };
  }

  async resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument> {
    const match = input.match(this.urlPattern);
    if (!match) throw new Error('Invalid Feishu URL');

    const token = match[1];
    const type = input.includes('/wiki/') ? 'wiki' : 'docx';

    const response = await fetch(`${config?.apiBaseUrl ?? ''}/api/connectors/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: this.source,
        input,
        token: config?.token,
        meta: { token, type },
      }),
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      throw new Error(`飞书文档解析失败: ${message}`);
    }

    return parseResponse<ResolvedDocument>(response);
  }
}

export function extractFeishuToken(input: string): { type: 'docx' | 'wiki'; token: string } | null {
  const match = input.match(/feishu\.cn\/(?:docs|docx|wiki)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  const type = input.includes('/wiki/') ? 'wiki' : 'docx';
  return { type, token: match[1] };
}

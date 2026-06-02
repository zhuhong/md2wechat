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

export class NotionConnector implements DocumentConnector {
  readonly source = 'notion' as const;

  validateInput(input: string): { valid: boolean; error?: string } {
    if (!extractNotionPageId(input)) {
      return { valid: false, error: '请输入有效的 Notion 页面 URL 或 Page ID' };
    }
    return { valid: true };
  }

  async resolve(input: string, config?: ConnectorConfig): Promise<ResolvedDocument> {
    const pageId = extractNotionPageId(input);
    if (!pageId) throw new Error('Invalid Notion page id');

    const response = await fetch(`${config?.apiBaseUrl ?? ''}/api/connectors/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: this.source,
        input,
        token: config?.token,
        meta: { pageId },
      }),
    });

    if (!response.ok) {
      throw new Error(`Notion 解析失败: ${response.statusText}`);
    }

    return parseResponse<ResolvedDocument>(response);
  }
}

export function extractNotionPageId(input: string): string | null {
  const normalized = input.replace(/-/g, '');
  const match = normalized.match(/[a-f0-9]{32}/i);
  return match?.[0] ?? null;
}

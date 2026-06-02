import type { DocumentConnector, ResolvedDocument, ExternalAsset, ConnectorConfig } from './types.js';

export class LocalConnector implements DocumentConnector {
  readonly source = 'local' as const;

  validateInput(input: string): { valid: boolean; error?: string } {
    if (typeof input !== 'string' || input.trim().length === 0) {
      return { valid: false, error: '请输入 Markdown 或 HTML 内容' };
    }
    return { valid: true };
  }

  async resolve(input: string, _config?: ConnectorConfig): Promise<ResolvedDocument> {
    const trimmed = input.trim();

    // Basic HTML detection
    const isHtml = /^\s*<(!doctype\s+html|html)/i.test(trimmed) ||
      (trimmed.includes('<html') && trimmed.includes('</html>'));

    let markdown: string;
    let title: string;
    const assets: ExternalAsset[] = [];
    const warnings: string[] = [];

    if (isHtml) {
      // Minimal HTML-to-Markdown placeholder (to be expanded)
      markdown = this._stripHtml(trimmed);
      title = this._extractTitleFromHtml(trimmed) || '未命名文档';
      warnings.push('HTML 解析暂未实现完整支持。');
    } else {
      markdown = trimmed;
      title = this._extractTitleFromMarkdown(trimmed) || '未命名文档';
    }

    // Collect external image URLs from Markdown
    const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
    let match: RegExpExecArray | null;
    const seenUrls = new Set<string>();
    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[2];
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      assets.push({
        id: `local-asset-${assets.length + 1}`,
        type: 'image',
        originalUrl: url,
        filename: undefined,
        mimeType: undefined,
        requiresAuth: false,
      });
    }

    return {
      source: this.source,
      title,
      markdown,
      assets,
      warnings,
    };
  }

  private _stripHtml(html: string): string {
    // Very naive strip for MVP
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private _extractTitleFromMarkdown(md: string): string | undefined {
    const match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : undefined;
  }

  private _extractTitleFromHtml(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (match) return match[1].trim();
    const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    return h1 ? h1[1].trim() : undefined;
  }
}

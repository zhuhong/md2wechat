import type { ExternalAsset, ResolvedDocument } from '@md2wechat/connectors';
import { getFeishuTenantAccessToken } from './feishuAuth.js';

type FeishuDocKind = 'docx' | 'wiki';

type FeishuDocumentRef = {
  kind: FeishuDocKind;
  token: string;
};

type FeishuApiResponse<T> = {
  code: number;
  msg?: string;
  data?: T;
};

type FeishuContentData = {
  content?: string;
};

type FeishuWikiNodeData = {
  node?: {
    obj_token?: string;
    obj_type?: string;
    title?: string;
  };
};

const FEISHU_URL_PATTERN = /https?:\/\/[^/]+\.feishu\.cn\/(?:docs|docx|wiki)\/([a-zA-Z0-9]+)/;

export function parseFeishuDocumentUrl(input: string): FeishuDocumentRef | null {
  const match = input.match(FEISHU_URL_PATTERN);
  if (!match) return null;

  return {
    kind: input.includes('/wiki/') ? 'wiki' : 'docx',
    token: match[1],
  };
}

export async function resolveFeishuDocument(
  input: string,
  accessTokenOverride?: string
): Promise<ResolvedDocument> {
  const ref = parseFeishuDocumentUrl(input);
  if (!ref) {
    throw new Error('Invalid Feishu document URL');
  }

  const accessToken = accessTokenOverride || (await getFeishuTenantAccessToken());
  const warnings: string[] = [];

  let docToken = ref.token;
  let titleFromWiki: string | undefined;

  if (ref.kind === 'wiki') {
    const wikiNode = await fetchWikiNode(ref.token, accessToken);
    if (wikiNode.objType !== 'docx') {
      throw new Error(`Unsupported Feishu wiki object type: ${wikiNode.objType || 'unknown'}`);
    }
    docToken = wikiNode.objToken;
    titleFromWiki = wikiNode.title;
  }

  const markdown = await fetchDocumentMarkdown(docToken, accessToken);
  const assets = extractMarkdownImageAssets(markdown);
  const title = titleFromWiki || extractTitleFromMarkdown(markdown) || '未命名飞书文档';

  if (assets.length > 0) {
    warnings.push('文档包含图片。飞书图片可能需要鉴权或会过期，复制到公众号前建议进入图片上传/替换流程。');
  }

  return {
    source: 'feishu',
    title,
    markdown,
    assets,
    warnings,
    metadata: {
      docToken,
      originalToken: ref.token,
      originalKind: ref.kind,
    },
  };
}

async function fetchDocumentMarkdown(docToken: string, accessToken: string): Promise<string> {
  const url = new URL('https://open.feishu.cn/open-apis/docs/v1/content');
  url.searchParams.set('doc_token', docToken);
  url.searchParams.set('doc_type', 'docx');
  url.searchParams.set('content_type', 'markdown');
  url.searchParams.set('lang', 'zh');

  const data = await fetchFeishuApi<FeishuContentData>(url, accessToken);
  if (!data.content) {
    throw new Error('Feishu response did not include document markdown content');
  }

  return normalizeMarkdown(data.content);
}

async function fetchWikiNode(
  wikiToken: string,
  accessToken: string
): Promise<{ objToken: string; objType: string; title?: string }> {
  const url = new URL('https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node');
  url.searchParams.set('token', wikiToken);

  const data = await fetchFeishuApi<FeishuWikiNodeData>(url, accessToken);
  const node = data.node;
  if (!node?.obj_token) {
    throw new Error('Feishu wiki response did not include obj_token');
  }

  return {
    objToken: node.obj_token,
    objType: node.obj_type ?? '',
    title: node.title,
  };
}

async function fetchFeishuApi<T>(url: URL, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Feishu API request failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ''}`
    );
  }

  const payload = (await response.json()) as FeishuApiResponse<T>;
  if (payload.code !== 0 || !payload.data) {
    throw new Error(`Feishu API error: code ${payload.code}${payload.msg ? ` - ${payload.msg}` : ''}`);
  }

  return payload.data;
}

function normalizeMarkdown(markdown: string): string {
  return convertHtmlTablesToMarkdown(markdown)
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function convertHtmlTablesToMarkdown(markdown: string): string {
  return markdown.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (tableHtml) => {
    const rows = extractTableRows(tableHtml);
    if (rows.length === 0) return tableHtml;

    const columnCount = Math.max(...rows.map((row) => row.length));
    if (columnCount === 0) return tableHtml;

    const normalizedRows = rows.map((row) => {
      const cells = [...row];
      while (cells.length < columnCount) cells.push('');
      return cells.slice(0, columnCount).map(formatMarkdownTableCell);
    });

    const [header, ...body] = normalizedRows;
    const separator = Array.from({ length: columnCount }, () => '---');
    const tableLines = [
      toMarkdownTableRow(header),
      toMarkdownTableRow(separator),
      ...body.map(toMarkdownTableRow),
    ];

    return `\n\n${tableLines.join('\n')}\n\n`;
  });
}

function extractTableRows(tableHtml: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    const rowHtml = rowMatch[1];
    const cells: string[] = [];
    const cellRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;

    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(htmlCellToText(cellMatch[1]));
    }

    if (cells.length > 0) rows.push(cells);
  }

  return rows;
}

function htmlCellToText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(?:p|div|section|article|blockquote|li)>/gi, ' ')
      .replace(/<[^>]+>/g, '')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMarkdownTableCell(text: string): string {
  return text.replace(/\|/g, '\\|');
}

function toMarkdownTableRow(cells: string[]): string {
  return `| ${cells.join(' | ')} |`;
}

function decodeHtmlEntities(text: string): string {
  const namedEntities: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const codePoint = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : match;
    }

    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

function extractTitleFromMarkdown(markdown: string): string | undefined {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function extractMarkdownImageAssets(markdown: string): ExternalAsset[] {
  const assets: ExternalAsset[] = [];
  const seen = new Set<string>();
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

  let match: RegExpExecArray | null;
  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[2];
    if (seen.has(url)) continue;
    seen.add(url);

    assets.push({
      id: `feishu-image-${assets.length + 1}`,
      type: 'image',
      originalUrl: url,
      filename: extractFilename(url),
      requiresAuth: isFeishuProtectedUrl(url),
    });
  }

  return assets;
}

function isFeishuProtectedUrl(url: string): boolean {
  return /(?:feishu|larksuite)\.(?:cn|com)/i.test(url);
}

function extractFilename(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const last = parsed.pathname.split('/').filter(Boolean).pop();
    return last ? decodeURIComponent(last) : undefined;
  } catch {
    return undefined;
  }
}

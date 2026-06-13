import type { ResolvedDocument, ExternalAsset } from '@md2wechat/connectors';
import { config } from '../config.js';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

type RichTextItem = {
  type: 'text' | 'mention' | 'equation';
  text?: { content: string; link?: { url: string } | null };
  equation?: { expression: string };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
  plain_text?: string;
  href?: string | null;
};

type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  _children?: NotionBlock[];
  [key: string]: unknown;
};

type NotionListResponse = {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor: string | null;
};

async function notionFetch(url: string, apiKey: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Notion API error: ${response.status} ${response.statusText}${body ? ` — ${body}` : ''}`
    );
  }

  return response.json();
}

async function fetchPageTitle(pageId: string, apiKey: string): Promise<string> {
  const page = (await notionFetch(`${NOTION_API_BASE}/pages/${pageId}`, apiKey)) as {
    properties?: Record<string, { type?: string; title?: RichTextItem[] }>;
  };

  const titleProp = Object.values(page.properties ?? {}).find((p) => p.type === 'title');
  if (titleProp?.title) {
    return titleProp.title.map((t) => t.plain_text ?? '').join('') || '未命名 Notion 页面';
  }
  return '未命名 Notion 页面';
}

async function fetchAllBlocks(blockId: string, apiKey: string, depth = 0): Promise<NotionBlock[]> {
  if (depth > 5) return [];

  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL(`${NOTION_API_BASE}/blocks/${blockId}/children`);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);

    const data = (await notionFetch(url.toString(), apiKey)) as NotionListResponse;
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  for (const block of blocks) {
    if (block.has_children && block.type !== 'table') {
      block._children = await fetchAllBlocks(block.id, apiKey, depth + 1);
    }
  }

  // Fetch table rows separately (they are children but need special handling)
  for (const block of blocks) {
    if (block.type === 'table' && block.has_children) {
      block._children = await fetchAllBlocks(block.id, apiKey, depth + 1);
    }
  }

  return blocks;
}

function richTextToMarkdown(richTexts: RichTextItem[]): string {
  return richTexts
    .map((item) => {
      if (item.type === 'equation' && item.equation) {
        return `$${item.equation.expression}$`;
      }

      let text = item.plain_text ?? item.text?.content ?? '';
      if (!text) return '';

      const url = item.href ?? item.text?.link?.url ?? null;
      const ann = item.annotations;

      if (ann?.code) text = `\`${text}\``;
      if (ann?.bold) text = `**${text}**`;
      if (ann?.italic) text = `*${text}*`;
      if (ann?.strikethrough) text = `~~${text}~~`;

      if (url) text = `[${text}](${url})`;

      return text;
    })
    .join('');
}

type ConvertResult = { lines: string[]; assets: ExternalAsset[] };

function blocksToMarkdown(blocks: NotionBlock[]): ConvertResult {
  const lines: string[] = [];
  const assets: ExternalAsset[] = [];
  let assetCounter = 0;

  function addBlock(block: NotionBlock, indent = ''): void {
    const type = block.type;
    const data = (block[type] ?? {}) as Record<string, unknown>;
    const richTexts = (data['rich_text'] as RichTextItem[] | undefined) ?? [];
    const text = richTextToMarkdown(richTexts);

    switch (type) {
      case 'paragraph':
        lines.push(indent + (text || ''));
        break;

      case 'heading_1':
        lines.push(`# ${text}`);
        break;
      case 'heading_2':
        lines.push(`## ${text}`);
        break;
      case 'heading_3':
        lines.push(`### ${text}`);
        break;

      case 'bulleted_list_item':
        lines.push(`${indent}- ${text}`);
        if (block._children) {
          for (const child of block._children) addBlock(child, indent + '  ');
        }
        return;

      case 'numbered_list_item':
        lines.push(`${indent}1. ${text}`);
        if (block._children) {
          for (const child of block._children) addBlock(child, indent + '  ');
        }
        return;

      case 'to_do': {
        const checked = (data['checked'] as boolean | undefined) ? 'x' : ' ';
        lines.push(`${indent}- [${checked}] ${text}`);
        break;
      }

      case 'code': {
        const lang = (data['language'] as string | undefined) ?? '';
        lines.push(`\`\`\`${lang}`);
        lines.push(text);
        lines.push('```');
        break;
      }

      case 'quote':
        for (const line of (text || '').split('\n')) {
          lines.push(`> ${line}`);
        }
        break;

      case 'callout': {
        const iconData = data['icon'] as { type?: string; emoji?: string } | undefined;
        const icon = iconData?.emoji ? iconData.emoji + ' ' : '';
        lines.push(':::info');
        lines.push(icon + text);
        lines.push(':::');
        break;
      }

      case 'divider':
        lines.push('---');
        break;

      case 'image': {
        const imgType = data['type'] as 'file' | 'external' | undefined;
        const fileData = data['file'] as { url?: string } | undefined;
        const externalData = data['external'] as { url?: string } | undefined;
        const url = imgType === 'external' ? externalData?.url : fileData?.url;
        const caption = (data['caption'] as RichTextItem[] | undefined)
          ? richTextToMarkdown(data['caption'] as RichTextItem[])
          : '';
        if (url) {
          assetCounter++;
          assets.push({
            id: `notion-image-${assetCounter}`,
            type: 'image',
            originalUrl: url,
            requiresAuth: imgType === 'file',
          });
          lines.push(`![${caption}](${url})`);
        }
        break;
      }

      case 'table': {
        const tableWidth = (data['table_width'] as number | undefined) ?? 1;
        const rows = block._children ?? [];
        if (rows.length === 0) break;

        for (let i = 0; i < rows.length; i++) {
          const rowData = (rows[i]['table_row'] ?? {}) as { cells?: RichTextItem[][] };
          const cells = (rowData.cells ?? []).map((cell) =>
            richTextToMarkdown(cell).replace(/\|/g, '\\|')
          );
          lines.push(`| ${cells.join(' | ')} |`);
          if (i === 0) {
            lines.push(`| ${Array(tableWidth).fill('---').join(' | ')} |`);
          }
        }
        return;
      }

      case 'toggle':
        lines.push(text);
        if (block._children) {
          for (const child of block._children) addBlock(child, indent + '  ');
        }
        return;

      case 'column_list':
        if (block._children) {
          for (const col of block._children) {
            if (col._children) {
              for (const child of col._children) addBlock(child, indent);
            }
          }
        }
        return;

      case 'column':
        if (block._children) {
          for (const child of block._children) addBlock(child, indent);
        }
        return;

      case 'child_page': {
        const title = (data['title'] as string | undefined) ?? 'Untitled';
        lines.push(`**[${title}]**`);
        break;
      }

      default:
        if (text) lines.push(indent + text);
        break;
    }

    if (block._children && !['bulleted_list_item', 'numbered_list_item', 'toggle', 'column', 'column_list', 'table'].includes(type)) {
      for (const child of block._children) addBlock(child, indent);
    }
  }

  for (const block of blocks) {
    addBlock(block);
    lines.push('');
  }

  return { lines, assets };
}

export async function resolveNotionDocument(
  pageId: string,
  apiKeyOverride?: string,
): Promise<ResolvedDocument> {
  const apiKey = apiKeyOverride || config.notionIntegrationToken;
  if (!apiKey) {
    throw new Error('Missing NOTION_INTEGRATION_TOKEN. 请在 server/.env 中配置 NOTION_INTEGRATION_TOKEN。');
  }

  const [title, blocks] = await Promise.all([
    fetchPageTitle(pageId, apiKey),
    fetchAllBlocks(pageId, apiKey),
  ]);

  const { lines, assets } = blocksToMarkdown(blocks);
  const markdown = lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const warnings: string[] = [];
  if (assets.some((a) => a.requiresAuth)) {
    warnings.push(
      'Notion 内部图片链接有时效性，复制到公众号前建议替换为永久图床地址。',
    );
  }

  return {
    source: 'notion',
    title,
    markdown,
    assets,
    warnings,
    metadata: { pageId },
  };
}

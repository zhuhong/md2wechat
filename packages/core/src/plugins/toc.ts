import type MarkdownIt from 'markdown-it';

export interface TocItem {
  level: number;
  title: string;
  slug: string;
}

export function tocPlugin(md: MarkdownIt): void {
  md.core.ruler.before('inline', 'toc_collect', (state) => {
    const tocItems: TocItem[] = [];
    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open' && /^h[1-6]$/.test(token.tag)) {
        const level = parseInt(token.tag.slice(1), 10);
        const inline = tokens[i + 1];
        if (inline && inline.type === 'inline') {
          const title = inline.content;
          const slug = slugify(title);
          tocItems.push({ level, title, slug });
          token.attrSet('id', slug);
        }
      }
    }

    state.env.tocItems = tocItems;
  });

  // Inline rule for [[toc]] placeholder
  md.inline.ruler.before('text', 'toc_placeholder', (state, silent) => {
    if (state.src.slice(state.pos, state.pos + 7) !== '[[toc]]') return false;
    if (!silent) {
      const token = state.push('toc_placeholder', '', 0);
      token.content = '[[toc]]';
    }
    state.pos += 7;
    return true;
  });

  md.renderer.rules.toc_placeholder = (_tokens, _idx, _options, env) => {
    const items = (env?.tocItems ?? []) as TocItem[];
    if (!items.length) return '';
    return renderToc(items);
  };
}

function renderToc(items: TocItem[]): string {
  const lines: string[] = [];
  lines.push(
    '<nav style="margin:1em 0;padding:1em;background:#f8f9fa;border-radius:6px;">'
  );
  lines.push(
    '<strong style="display:block;margin-bottom:0.5em;">目录</strong>'
  );
  lines.push(
    '<ul style="list-style:none;padding-left:0;margin:0;">'
  );
  for (const item of items) {
    const indent = (item.level - 1) * 1.5;
    lines.push(
      `<li style="margin:0.25em 0;padding-left:${indent}em;"><a href="#${item.slug}" style="color:#0366d6;text-decoration:none;">${escapeHtml(item.title)}</a></li>`
    );
  }
  lines.push('</ul>');
  lines.push('</nav>');
  return lines.join('\n');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 64);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

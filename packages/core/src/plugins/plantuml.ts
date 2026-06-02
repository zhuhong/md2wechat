import type MarkdownIt from 'markdown-it';

export function plantumlPlugin(md: MarkdownIt): void {
  const originalFence =
    md.renderer.rules.fence ??
    ((_tokens, _idx, _options, _env, _self) => _self.renderToken(_tokens, _idx, _options));

  md.renderer.rules.fence = (tokens, idx, options, _env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info.split(/\s+/)[0] !== 'plantuml') {
      return originalFence(tokens, idx, options, _env, self);
    }

    const content = token.content.trim();
    // Produce a placeholder; preview component will render it
    return `<div class="plantuml" data-diagram="${encodeHtml(content)}">${escapeHtml(content)}</div>`;
  };
}

function encodeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

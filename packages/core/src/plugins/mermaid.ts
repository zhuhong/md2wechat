import type MarkdownIt from 'markdown-it';

export function mermaidPlugin(md: MarkdownIt): void {
  const originalFence =
    md.renderer.rules.fence ??
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info.split(/\s+/)[0] !== 'mermaid') {
      return originalFence(tokens, idx, options, env, self);
    }

    const content = token.content.trim();
    // Produce a placeholder; post-processor will replace with rendered SVG
    return `<div data-diagram-type="mermaid" data-diagram="${encodeHtml(content)}">${escapeHtml(content)}</div>`;
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

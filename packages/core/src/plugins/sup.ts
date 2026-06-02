import type MarkdownIt from 'markdown-it';

export function supPlugin(md: MarkdownIt): void {
  md.inline.ruler.after('emphasis', 'sup', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x5e /* ^ */) return false;

    const start = state.pos + 1;
    const end = state.src.indexOf('^', start);
    if (end === -1) return false;
    if (end === start) return false;

    if (!silent) {
      const token = state.push('sup', 'sup', 0);
      token.content = state.src.slice(start, end);
      token.markup = '^';
    }

    state.pos = end + 1;
    return true;
  });

  md.renderer.rules.sup = (tokens, idx) => {
    return `<sup>${escapeHtml(tokens[idx].content)}</sup>`;
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

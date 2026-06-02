import type MarkdownIt from 'markdown-it';

export function markPlugin(md: MarkdownIt): void {
  md.inline.ruler.after('emphasis', 'mark', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x3d /* = */) return false;
    if (state.src.charCodeAt(state.pos + 1) !== 0x3d /* = */) return false;

    const start = state.pos + 2;
    const end = state.src.indexOf('==', start);
    if (end === -1) return false;
    if (end === start) return false;

    if (!silent) {
      const token = state.push('mark', 'mark', 0);
      token.content = state.src.slice(start, end);
      token.markup = '==';
    }

    state.pos = end + 2;
    return true;
  });

  md.renderer.rules.mark = (tokens, idx) => {
    return `<mark>${escapeHtml(tokens[idx].content)}</mark>`;
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

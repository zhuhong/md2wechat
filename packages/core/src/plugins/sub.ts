import type MarkdownIt from 'markdown-it';

export function subPlugin(md: MarkdownIt): void {
  md.inline.ruler.after('emphasis', 'sub', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x7e /* ~ */) return false;
    if (state.src.charCodeAt(state.pos + 1) === 0x7e /* ~ */) return false;

    const start = state.pos + 1;
    const end = state.src.indexOf('~', start);
    if (end === -1) return false;
    if (end === start) return false;

    if (!silent) {
      const token = state.push('sub', 'sub', 0);
      token.content = state.src.slice(start, end);
      token.markup = '~';
    }

    state.pos = end + 1;
    return true;
  });

  md.renderer.rules.sub = (tokens, idx) => {
    return `<sub>${escapeHtml(tokens[idx].content)}</sub>`;
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

import type MarkdownIt from 'markdown-it';
import katex from 'katex';

function renderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      output: 'mathml',
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    const escaped = escapeHtml(tex);
    return displayMode
      ? `<p style="color:#cf222e;">${escaped}</p>`
      : `<span style="color:#cf222e;">${escaped}</span>`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function katexPlugin(md: MarkdownIt): void {
  // Inline math: $...$
  md.inline.ruler.before('escape', 'katex-inline', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x24 /* $ */) return false;

    const start = state.pos + 1;
    const endMatch = state.src.indexOf('$', start);
    if (endMatch === -1) return false;

    const tex = state.src.slice(start, endMatch);
    if (!tex.trim()) return false;

    if (!silent) {
      const token = state.push('katex_inline', 'span', 0);
      token.content = tex;
      token.markup = '$';
    }

    state.pos = endMatch + 1;
    return true;
  });

  // Block math: $$...$$
  md.block.ruler.before('fence', 'katex-block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    if (pos + 2 > max) return false;
    if (state.src.slice(pos, pos + 2) !== '$$') return false;

    let nextLine = startLine + 1;
    let found = false;
    while (nextLine < endLine) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];
      if (linePos + 2 <= lineMax && state.src.slice(linePos, linePos + 2) === '$$') {
        found = true;
        break;
      }
      nextLine++;
    }

    if (!found) return false;

    if (!silent) {
      const token = state.push('katex_block', 'div', 0);
      const startContent = state.bMarks[startLine] + state.tShift[startLine] + 2;
      const endContent = state.bMarks[nextLine] + state.tShift[nextLine];
      token.content = state.src.slice(startContent, endContent).trim();
      token.map = [startLine, nextLine + 1];
    }

    state.line = nextLine + 1;
    return true;
  });

  md.renderer.rules.katex_inline = (tokens, idx) => {
    return renderKatex(tokens[idx].content, false);
  };

  md.renderer.rules.katex_block = (tokens, idx) => {
    return renderKatex(tokens[idx].content, true);
  };
}

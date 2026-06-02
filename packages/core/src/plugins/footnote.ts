import type MarkdownIt from 'markdown-it';

/**
 * Lightweight footnote plugin for markdown-it
 * Supports [^label] and [^label]: content
 */
export function footnotePlugin(md: MarkdownIt): void {
  // Inline footnote reference [^label]
  md.inline.ruler.after('link', 'footnote_ref', (state, silent) => {
    if (state.src.charCodeAt(state.pos) !== 0x5b /* [ */) return false;
    if (state.src.charCodeAt(state.pos + 1) !== 0x5e /* ^ */) return false;

    const labelStart = state.pos + 2;
    const labelEnd = state.src.indexOf(']', labelStart);
    if (labelEnd === -1) return false;

    const label = state.src.slice(labelStart, labelEnd);
    if (!label) return false;

    if (!silent) {
      const token = state.push('footnote_ref', 'sup', 0);
      token.meta = { label };
      token.content = label;
    }

    state.pos = labelEnd + 1;
    return true;
  });

  // Block footnote definition [^label]: content
  md.block.ruler.before('reference', 'footnote_def', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    if (pos + 4 > max) return false;
    if (state.src.charCodeAt(pos) !== 0x5b /* [ */) return false;
    if (state.src.charCodeAt(pos + 1) !== 0x5e /* ^ */) return false;

    const labelStart = pos + 2;
    const labelEnd = state.src.indexOf(']', labelStart);
    if (labelEnd === -1 || labelEnd >= max) return false;
    if (state.src.charCodeAt(labelEnd + 1) !== 0x3a /* : */) return false;

    const label = state.src.slice(labelStart, labelEnd);
    if (!label) return false;

    // Collect continuation lines (indented or blank)
    let nextLine = startLine + 1;
    while (nextLine < endLine) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
      if (linePos >= state.eMarks[nextLine]) {
        nextLine++;
        continue;
      }
      if (state.tShift[nextLine] < 4) break;
      nextLine++;
    }

    if (!silent) {
      const token = state.push('footnote_def', '', 0);
      token.meta = { label };
      const contentStart = labelEnd + 2;
      const lines: string[] = [];
      lines.push(state.src.slice(contentStart, max).trimStart());
      for (let i = startLine + 1; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        lines.push(state.src.slice(linePos + 4, lineMax));
      }
      token.content = lines.join('\n').trim();
      token.map = [startLine, nextLine];
      token.block = true;
    }

    state.line = nextLine;
    return true;
  });

  md.renderer.rules.footnote_ref = (tokens, idx) => {
    const label = (tokens[idx].meta as { label: string }).label;
    return `<sup id="fnref-${label}"><a href="#fn-${label}" style="text-decoration:none;color:#0366d6;">[${label}]</a></sup>`;
  };

  md.renderer.rules.footnote_def = (tokens, idx) => {
    const label = (tokens[idx].meta as { label: string }).label;
    const content = tokens[idx].content;
    const parsed = md.renderInline(content);
    return `<div id="fn-${label}" style="font-size:0.875em;color:#666;margin:0.5em 0;">${label}. ${parsed} <a href="#fnref-${label}" style="color:#0366d6;">↩</a></div>`;
  };
}

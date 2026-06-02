import type MarkdownIt from 'markdown-it';

const ALERT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];

/**
 * GFM Alert plugin
 * Supports: > [!NOTE], > [!WARNING], > [!CAUTION], > [!TIP], > [!IMPORTANT]
 */
export function alertPlugin(md: MarkdownIt): void {
  md.block.ruler.before('blockquote', 'gfm_alert', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    // Must start with "> "
    if (pos + 2 > max) return false;
    if (state.src.charCodeAt(pos) !== 0x3e /* > */) return false;
    if (state.src.charCodeAt(pos + 1) !== 0x20 /* space */) return false;

    // Check for "[!" after "> "
    const marker = state.src.slice(pos + 2, pos + 5);
    if (marker !== '[!') return false;

    const typeStart = pos + 5;
    const typeEnd = state.src.indexOf(']', typeStart);
    if (typeEnd === -1 || typeEnd >= max) return false;

    const type = state.src.slice(typeStart, typeEnd).toUpperCase();
    if (!ALERT_TYPES.includes(type)) return false;

    // Find continuation lines of this alert block
    let nextLine = startLine + 1;
    while (nextLine < endLine) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];
      if (linePos >= lineMax) {
        nextLine++;
        continue;
      }
      if (state.src.charCodeAt(linePos) !== 0x3e /* > */) break;
      nextLine++;
    }

    if (!silent) {
      const token = state.push('alert', 'div', 0);
      token.meta = { type };
      token.map = [startLine, nextLine];

      // Collect inner content (strip the alert marker from first line)
      const lines: string[] = [];
      const firstContent = state.src.slice(typeEnd + 1, max).trimStart();
      if (firstContent) lines.push(firstContent);

      for (let i = startLine + 1; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        let line = state.src.slice(linePos, lineMax);
        if (line.startsWith('> ')) line = line.slice(2);
        else if (line.startsWith('>')) line = line.slice(1);
        lines.push(line);
      }
      token.content = lines.join('\n');
    }

    state.line = nextLine;
    return true;
  });

  md.renderer.rules.alert = (tokens, idx) => {
    const token = tokens[idx];
    const type = ((token.meta as { type: string }).type) ?? 'NOTE';
    const style = getAlertStyle(type);
    const content = md.render(token.content);
    return `<div style="${style}"><strong style="display:block;margin-bottom:0.5em;">${type}</strong>${content}</div>`;
  };
}

function getAlertStyle(type: string): string {
  const base = 'padding:0.75em 1em;margin:1em 0;border-radius:6px;border-left:4px solid;';
  switch (type) {
    case 'NOTE':
      return `${base}background-color:#e7f3ff;border-color:#0969da;color:#0969da;`;
    case 'TIP':
      return `${base}background-color:#ddf4e8;border-color:#1a7f37;color:#1a7f37;`;
    case 'IMPORTANT':
      return `${base}background-color:#f5f0ff;border-color:#8957e5;color:#8957e5;`;
    case 'WARNING':
      return `${base}background-color:#fff8c5;border-color:#9a6700;color:#9a6700;`;
    case 'CAUTION':
      return `${base}background-color:#ffebe9;border-color:#cf222e;color:#cf222e;`;
    default:
      return base;
  }
}

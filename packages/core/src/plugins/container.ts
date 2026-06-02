import type MarkdownIt from 'markdown-it';

/**
 * Custom container plugin (:::tip, :::warning, :::danger, :::info)
 */
export function containerPlugin(md: MarkdownIt, name: string): void {
  md.block.ruler.before('fence', `container_${name}`, (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];

    if (pos + 3 > max) return false;
    if (state.src.charCodeAt(pos) !== 0x3a /* : */) return false;
    if (state.src.charCodeAt(pos + 1) !== 0x3a /* : */) return false;
    if (state.src.charCodeAt(pos + 2) !== 0x3a /* : */) return false;

    const marker = state.src.slice(pos + 3, max).trim();
    const openReg = new RegExp(`^${name}\\s*$`);
    if (!openReg.test(marker)) return false;

    // Find closing fence :::
    let nextLine = startLine + 1;
    while (nextLine < endLine) {
      const linePos = state.bMarks[nextLine] + state.tShift[nextLine];
      const lineMax = state.eMarks[nextLine];
      if (linePos + 3 <= lineMax && state.src.slice(linePos, linePos + 3) === ':::') {
        const closeMarker = state.src.slice(linePos + 3, lineMax).trim();
        if (closeMarker === '' || new RegExp(`^end${name}\\s*$`).test(closeMarker)) {
          break;
        }
      }
      nextLine++;
    }

    if (!silent) {
      const token = state.push('container', 'div', 0);
      token.meta = { type: name };
      token.map = [startLine, nextLine];

      const lines: string[] = [];
      for (let i = startLine + 1; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        lines.push(state.src.slice(linePos, lineMax));
      }
      token.content = lines.join('\n');
    }

    state.line = nextLine + 1;
    return true;
  });

  md.renderer.rules.container = (tokens, idx) => {
    const token = tokens[idx];
    const type = (token.meta as { type: string }).type ?? 'tip';
    const style = getContainerStyle(type);
    const content = md.render(token.content);
    return `<div style="${style}">${content}</div>`;
  };
}

function getContainerStyle(name: string): string {
  const base = 'padding:0.75em 1em;margin:1em 0;border-radius:6px;border-left:4px solid;';
  switch (name) {
    case 'tip':
      return `${base}background-color:#ddf4e8;border-color:#1a7f37;color:#1a7f37;`;
    case 'warning':
      return `${base}background-color:#fff8c5;border-color:#9a6700;color:#9a6700;`;
    case 'danger':
      return `${base}background-color:#ffebe9;border-color:#cf222e;color:#cf222e;`;
    case 'info':
      return `${base}background-color:#e7f3ff;border-color:#0969da;color:#0969da;`;
    default:
      return base;
  }
}

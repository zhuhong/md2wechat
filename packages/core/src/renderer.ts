import type MarkdownIt from 'markdown-it';
import type { Theme } from './theme/types.js';
import { renderTagStyle } from './theme/renderer.js';

/**
 * Override markdown-it render rules for WeChat compatibility.
 * Applies inline styles directly during rendering so that the preview
 * is correct even before post-processing.
 */
export function overrideRenderRules(md: MarkdownIt, theme?: Theme): void {
  const rules = md.renderer.rules;

  // Helper to inject inline style into token attrs before default rendering
  const injectStyle = (
    ruleName: string,
    styleProvider: () => string
  ) => {
    const original = rules[ruleName];
    rules[ruleName] = (tokens, idx, options, env, self) => {
      const token = tokens[idx];
      const style = styleProvider();
      if (style) {
        const existing = token.attrGet('style') ?? '';
        const combined = existing
          ? `${existing.trim().replace(/;?$/, '; ')}${style}`
          : style;
        token.attrSet('style', combined);
      }
      return original
        ? original(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options);
    };
  };

  if (theme) {
    injectStyle('table_open', () => renderTagStyle(theme, 'table'));
    injectStyle('th_open', () => renderTagStyle(theme, 'th'));
    injectStyle('td_open', () => renderTagStyle(theme, 'td'));
    injectStyle('blockquote_open', () => renderTagStyle(theme, 'blockquote'));
    injectStyle('hr', () => renderTagStyle(theme, 'hr'));
  }

  // Force table base styles for WeChat even without theme
  const origTableOpen = rules.table_open;
  rules.table_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const existing = token.attrGet('style') ?? '';
    const base = 'border-collapse: collapse; width: 100%;';
    token.attrSet(
      'style',
      existing ? `${existing.trim().replace(/;?$/, '; ')}${base}` : base
    );
    return origTableOpen
      ? origTableOpen(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options);
  };

  // Image max-width enforcement
  rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet('src') ?? '';
    const alt = self.renderInlineAsText(token.children ?? [], options, env);
    let style = token.attrGet('style') ?? '';
    const extra = 'max-width: 100%; height: auto; display: block; margin: 0 auto;';
    if (!style.includes('max-width')) {
      style = style ? `${style.trim().replace(/;?$/, '; ')}${extra}` : extra;
    }
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" style="${style}" />`;
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

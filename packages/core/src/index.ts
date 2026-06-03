import { createParser } from './parser.js';
import type {
  RenderOptions,
  RenderResult,
  ParserOptions,
  WechatOptions,
  Asset,
  Diagnostic,
} from './types.js';
import type { Theme } from './theme/types.js';
import { defaultTheme, minimalTheme, techTheme, elegantTheme } from './theme/presets/index.js';
import { inlineStyles } from './wechat/styleInliner.js';
import { processImages } from './wechat/imageProcessor.js';
import { sanitizeForWechat } from './wechat/sanitizer.js';
import { processCodeBlocks } from './wechat/codeBlockProcessor.js';
import type { ThemeOverrides } from './theme/merge.js';
import { mergeThemePresetWithOverrides } from './theme/merge.js';

export type {
  RenderOptions,
  RenderResult,
  ParserOptions,
  WechatOptions,
  Asset,
  Diagnostic,
};
export type { Theme } from './theme/types.js';
export type { ThemeOverrides } from './theme/merge.js';
export { defaultTheme, minimalTheme, techTheme, elegantTheme } from './theme/presets/index.js';
export { createParser } from './parser.js';
export { mergeThemePresetWithOverrides } from './theme/merge.js';

const DEFAULT_PARSER_OPTIONS: ParserOptions = {
  enableKatex: true,
  enableFootnote: true,
  enableAlert: true,
  enableToc: true,
  enableContainer: true,
  allowHtml: false,
  linkify: true,
  typographer: true,
};

const DEFAULT_WECHAT_OPTIONS: WechatOptions = {
  imageMode: 'keep-url',
  maxImageWidth: 677,
  sanitize: true,
  inlineStyles: true,
};

function resolveTheme(themeOrId?: string | Theme): Theme {
  if (typeof themeOrId === 'object' && themeOrId !== null) return themeOrId;
  const themeId = themeOrId as string | undefined;
  if (!themeId || themeId === 'default') return defaultTheme;
  if (themeId === 'minimal') return minimalTheme;
  if (themeId === 'tech') return techTheme;
  if (themeId === 'elegant') return elegantTheme;
  return defaultTheme;
}

/**
 * Render markdown to a WeChat-compatible HTML string.
 * This is the primary API used by the web app.
 */
export async function renderToWechatHTML(
  markdown: string,
  options?: { theme?: string | Theme; parser?: ParserOptions; wechat?: WechatOptions }
): Promise<string> {
  const result = await renderMarkdown(markdown, options);
  return result.previewHtml;
}

/**
 * Full renderer: markdown -> preview & clipboard HTML.
 */
export async function renderMarkdown(
  markdown: string,
  options?: { theme?: string | Theme; parser?: ParserOptions; wechat?: WechatOptions }
): Promise<RenderResult> {
  const theme = resolveTheme(options?.theme);
  const parserOpts = { ...DEFAULT_PARSER_OPTIONS, ...options?.parser };
  const wechatOpts = { ...DEFAULT_WECHAT_OPTIONS, ...options?.wechat };

  // 1. Parse markdown -> HTML
  const md = createParser(parserOpts, theme);
  const rawHtml = md.render(markdown);

  // 2. Post-process for WeChat compatibility
  const fullHtml = `<!DOCTYPE html><html><body>${rawHtml}</body></html>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');

  // Code blocks (Shiki highlighting) – before inlineStyles so themes are applied to Shiki output too
  const { diagnostics: codeDiagnostics } = await processCodeBlocks(doc, parserOpts);

  // Images
  const { assets, diagnostics: imageDiagnostics } = await processImages(doc, wechatOpts);

  // Sanitize (remove unsupported tags/attrs)
  const sanitizeDiagnostics = sanitizeForWechat(doc);

  // Theme inline styles + class cleanup (run last so all generated elements get styled)
  if (wechatOpts.inlineStyles) {
    inlineStyles(doc, theme);
  }

  // Build results
  const bodyHtml = doc.body?.innerHTML ?? '';
  const plainText = doc.body?.textContent ?? '';

  const allDiagnostics: Diagnostic[] = [
    ...codeDiagnostics,
    ...imageDiagnostics,
    ...sanitizeDiagnostics,
  ];

  return {
    previewHtml: bodyHtml,
    clipboardHtml: bodyHtml,
    plainText,
    assets,
    diagnostics: allDiagnostics,
  };
}

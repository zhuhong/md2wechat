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

export type {
  RenderOptions,
  RenderResult,
  ParserOptions,
  WechatOptions,
  Asset,
  Diagnostic,
};
export type { Theme } from './theme/types.js';
export { defaultTheme, minimalTheme, techTheme, elegantTheme } from './theme/presets/index.js';
export { createParser } from './parser.js';

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

function getThemeById(themeId?: string): Theme {
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
  options?: { theme?: string; parser?: ParserOptions; wechat?: WechatOptions }
): Promise<string> {
  const result = await renderMarkdown(markdown, options);
  return result.previewHtml;
}

/**
 * Full renderer: markdown -> preview & clipboard HTML.
 */
export async function renderMarkdown(
  markdown: string,
  options?: { theme?: string; parser?: ParserOptions; wechat?: WechatOptions }
): Promise<RenderResult> {
  const theme = getThemeById(options?.theme);
  const parserOpts = { ...DEFAULT_PARSER_OPTIONS, ...options?.parser };
  const wechatOpts = { ...DEFAULT_WECHAT_OPTIONS, ...options?.wechat };

  // 1. Parse markdown -> HTML
  const md = createParser(parserOpts, theme);
  const rawHtml = md.render(markdown);

  // 2. Post-process for WeChat compatibility
  const fullHtml = `<!DOCTYPE html><html><body>${rawHtml}</body></html>`;
  const parser = new DOMParser();
  const doc = parser.parseFromString(fullHtml, 'text/html');

  // Theme styles
  if (wechatOpts.inlineStyles) {
    inlineStyles(doc, theme);
  }

  // Code blocks (Shiki highlighting)
  const { diagnostics: codeDiagnostics } = await processCodeBlocks(doc, parserOpts);

  // Images
  const { assets, diagnostics: imageDiagnostics } = await processImages(doc, wechatOpts);

  // Sanitize (remove unsupported tags/attrs)
  const sanitizeDiagnostics = sanitizeForWechat(doc);

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

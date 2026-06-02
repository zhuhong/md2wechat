/**
 * Core types for md2wechat rendering engine
 */

export interface RenderResult {
  /** HTML for in-app preview (may include external resources) */
  previewHtml: string;
  /** Optimized HTML for clipboard copying into WeChat editor */
  clipboardHtml: string;
  /** Plain text fallback */
  plainText: string;
  /** External assets (images, etc.) detected during rendering */
  assets: Asset[];
  /** Compatibility warnings and rendering diagnostics */
  diagnostics: Diagnostic[];
}

export interface Asset {
  id: string;
  type: 'image' | 'svg' | 'file';
  originalUrl: string;
  filename?: string;
  mimeType?: string;
  /** Whether the asset needs to be uploaded/replaced for WeChat */
  requiresUpload: boolean;
  /** Current state in the document (original URL, placeholder, or uploaded URL) */
  currentSrc: string;
}

export interface Diagnostic {
  level: 'info' | 'warning' | 'error';
  message: string;
  source?: string;
}

export interface RenderOptions {
  /** Markdown source */
  markdown: string;
  /** Theme to apply */
  theme?: import('./theme/types.js').Theme;
  /** Parser / plugin options */
  parser?: ParserOptions;
  /** WeChat post-processing options */
  wechat?: WechatOptions;
  /** Additional CSS to inject (will be sanitized and inlined where possible) */
  customCss?: string;
}

export interface ParserOptions {
  /** Enable KaTeX math rendering */
  enableKatex?: boolean;
  /** Enable Mermaid diagram rendering */
  enableMermaid?: boolean;
  /** Enable PlantUML diagram rendering */
  enablePlantuml?: boolean;
  /** Enable footnotes */
  enableFootnote?: boolean;
  /** Enable GFM alerts */
  enableAlert?: boolean;
  /** Enable table of contents */
  enableToc?: boolean;
  /** Enable custom containers (tip/warning/danger) */
  enableContainer?: boolean;
  /** Enable subscript rendering (H~2~O) */
  enableSub?: boolean;
  /** Enable superscript rendering (x^2^) */
  enableSup?: boolean;
  /** Enable highlighted text rendering (==highlight==) */
  enableMark?: boolean;
  /** Languages to preload for Shiki highlighting (default: common set) */
  shikiLanguages?: string[];
  /** Shiki theme name (default: 'github-light') */
  shikiTheme?: string;
  /** Allow raw HTML in markdown (default: false for security) */
  allowHtml?: boolean;
  /** Auto-link URLs */
  linkify?: boolean;
  /** Smart punctuation */
  typographer?: boolean;
}

export interface WechatOptions {
  /** How to handle external images */
  imageMode?: 'keep-url' | 'upload' | 'placeholder';
  /** Max image width hint for WeChat */
  maxImageWidth?: number;
  /** Whether to remove unsupported tags */
  sanitize?: boolean;
  /** Whether to apply theme styles as inline CSS */
  inlineStyles?: boolean;
}

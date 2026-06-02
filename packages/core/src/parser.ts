import MarkdownIt from 'markdown-it';
import type { ParserOptions } from './types.js';
import { overrideRenderRules } from './renderer.js';
import { katexPlugin } from './plugins/katex.js';
import { mermaidPlugin } from './plugins/mermaid.js';
import { plantumlPlugin } from './plugins/plantuml.js';
import { footnotePlugin } from './plugins/footnote.js';
import { alertPlugin } from './plugins/alert.js';
import { tocPlugin } from './plugins/toc.js';
import { containerPlugin } from './plugins/container.js';
import { subPlugin } from './plugins/sub.js';
import { supPlugin } from './plugins/sup.js';
import { markPlugin } from './plugins/mark.js';
import type { Theme } from './theme/types.js';

export function createParser(
  options: ParserOptions,
  theme?: Theme
): MarkdownIt {
  const md = new MarkdownIt({
    html: options.allowHtml ?? false,
    xhtmlOut: true,
    breaks: true,
    linkify: options.linkify ?? true,
    typographer: options.typographer ?? true,
  });

  // Apply WeChat base compatibility renderers
  overrideRenderRules(md, theme);

  // Register plugins (order matters)
  if (options.enableKatex) {
    md.use(katexPlugin);
  }
  if (options.enableMermaid) {
    md.use(mermaidPlugin);
  }
  if (options.enablePlantuml ?? true) {
    md.use(plantumlPlugin);
  }
  if (options.enableFootnote) {
    md.use(footnotePlugin);
  }
  if (options.enableAlert) {
    md.use(alertPlugin);
  }
  if (options.enableToc) {
    md.use(tocPlugin);
  }
  if (options.enableContainer) {
    md.use(containerPlugin, 'tip');
    md.use(containerPlugin, 'warning');
    md.use(containerPlugin, 'danger');
    md.use(containerPlugin, 'info');
  }
  if (options.enableSub ?? true) {
    md.use(subPlugin);
  }
  if (options.enableSup ?? true) {
    md.use(supPlugin);
  }
  if (options.enableMark ?? true) {
    md.use(markPlugin);
  }

  return md;
}

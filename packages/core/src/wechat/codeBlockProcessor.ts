import { createHighlighter, type Highlighter } from 'shiki';
import type { Diagnostic, ParserOptions } from '../types.js';

let highlighter: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

const DEFAULT_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'html',
  'css',
  'bash',
  'json',
  'yaml',
  'markdown',
  'sql',
];

async function getHighlighter(options?: ParserOptions): Promise<Highlighter | null> {
  if (highlighter) return highlighter;
  if (initPromise) return initPromise;

  initPromise = createHighlighter({
    themes: [options?.shikiTheme ?? 'github-light'],
    langs: options?.shikiLanguages ?? DEFAULT_LANGUAGES,
  }).then((h) => {
    highlighter = h;
    return h;
  });

  return initPromise;
}

export async function processCodeBlocks(
  doc: Document,
  options?: ParserOptions
): Promise<{ diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];
  const preBlocks = doc.querySelectorAll('pre');

  const hl = await getHighlighter(options);
  if (!hl) {
    diagnostics.push({
      level: 'warning',
      message: 'Shiki highlighter 初始化失败，代码块将无高亮显示',
      source: 'codeBlockProcessor',
    });
  }

  Array.from(preBlocks).forEach((pre) => {
    const code = pre.querySelector('code');
    if (!code) return;

    const classes = code.getAttribute('class') ?? '';
    const langMatch = classes.match(/language-([a-zA-Z0-9_+-]+)/);
    const lang = langMatch?.[1] ?? 'text';
    const rawCode = code.textContent ?? '';

    if (hl) {
      try {
        const highlighted = hl.codeToHtml(rawCode, {
          lang,
          theme: options?.shikiTheme ?? 'github-light',
        });

        const wrapper = doc.createElement('div');
        wrapper.innerHTML = highlighted;
        const newPre = wrapper.querySelector('pre');
        if (newPre) {
          let style = newPre.getAttribute('style') ?? '';
          if (!style.includes('overflow-x')) {
            style += '; overflow-x: auto;';
          }
          if (!style.includes('white-space')) {
            style += '; white-space: pre-wrap; word-wrap: break-word;';
          }
          newPre.setAttribute('style', style.replace(/^;\s*/, ''));
          pre.parentNode?.replaceChild(newPre, pre);
          return;
        }
      } catch (err) {
        diagnostics.push({
          level: 'warning',
          message: `代码高亮失败 (${lang}): ${err instanceof Error ? err.message : String(err)}`,
          source: 'codeBlockProcessor',
        });
      }
    }

    // Fallback styling
    let style = pre.getAttribute('style') ?? '';
    if (!style.includes('background-color')) {
      style += '; background-color: #f6f8fa;';
    }
    if (!style.includes('padding')) {
      style += '; padding: 1em;';
    }
    if (!style.includes('border-radius')) {
      style += '; border-radius: 6px;';
    }
    if (!style.includes('overflow-x')) {
      style += '; overflow-x: auto;';
    }
    pre.setAttribute('style', style.replace(/^;\s*/, ''));
  });

  return { diagnostics };
}

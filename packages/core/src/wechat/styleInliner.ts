import type { Theme } from '../theme/types.js';
import { applyThemeToDocument } from '../theme/renderer.js';

/**
 * Convert any remaining <style> tags to inline styles where possible,
 * and ensure all elements have necessary inline styles for WeChat.
 */
export function inlineStyles(doc: Document, theme?: Theme): void {
  // Remove <style> tags - WeChat editor strips them
  const styleTags = doc.querySelectorAll('style');
  Array.from(styleTags).forEach((tag) => {
    tag.remove();
  });

  // Remove class attributes (WeChat editor strips them anyway),
  // but preserve classes on math/svg/formula elements needed by KaTeX.
  const elementsWithClass = doc.querySelectorAll('[class]');
  Array.from(elementsWithClass).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (
      [
        'math',
        'svg',
        'mrow',
        'mn',
        'mo',
        'mi',
        'msup',
        'msub',
        'mfrac',
        'annotation',
        'semantics',
        'mtext',
        'mspace',
        'mpadded',
        'menclose',
        'path',
        'g',
        'defs',
        'use',
        'rect',
        'line',
        'mark',
      ].includes(tag)
    ) {
      return;
    }
    // Preserve KaTeX classes so the preview stays correct.
    // Note: WeChat editor may still strip these classes on paste.
    if (el.closest('.katex') || el.classList.contains('katex')) {
      return;
    }
    el.removeAttribute('class');
  });

  // Apply theme tokens if provided
  if (theme) {
    applyThemeToDocument(doc, theme);
  }
}

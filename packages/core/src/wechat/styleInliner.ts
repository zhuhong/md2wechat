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
    // MathML and SVG elements — leave their attributes untouched
    if (
      [
        'math', 'annotation', 'annotation-xml', 'semantics',
        'mrow', 'mi', 'mn', 'mo', 'ms', 'mtext', 'mspace', 'mpadded',
        'mfrac', 'msqrt', 'mroot', 'msub', 'msup', 'msubsup',
        'munder', 'mover', 'munderover', 'mmultiscripts', 'mprescripts', 'none',
        'mtable', 'mtr', 'mtd', 'mlabeledtr', 'merror', 'mphantom', 'mstyle',
        'mfenced', 'menclose',
        'svg', 'path', 'g', 'defs', 'use', 'rect', 'line',
        'mark',
      ].includes(tag)
    ) {
      return;
    }
    // Preserve Shiki syntax-highlighting classes.
    if (el.closest('.shiki') || el.classList.contains('shiki')) {
      return;
    }
    el.removeAttribute('class');
  });

  // Apply theme tokens if provided
  if (theme) {
    applyThemeToDocument(doc, theme);
  }
}

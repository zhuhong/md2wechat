import type { Diagnostic } from '../types.js';

const ALLOWED_TAGS = new Set([
  'a', 'abbr', 'annotation', 'b', 'blockquote', 'br', 'code', 'defs', 'div',
  'em', 'g', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'line',
  'mark', 'math', 'menclose', 'mfrac', 'mi', 'mn', 'mo', 'mpadded', 'mrow',
  'mspace', 'msub', 'msup', 'mtext', 'nav', 'ol', 'p', 'path', 'pre', 'rect',
  'semantics', 'span', 'strong', 'sub', 'sup', 'svg', 'table', 'tbody', 'td',
  'th', 'thead', 'tr', 'ul', 'use',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'src', 'alt', 'title', 'style', 'id', 'class',
  'data-original-src', 'data-diagram', 'data-diagram-type', 'lang', 'xmlns',
]);

export function sanitizeForWechat(doc: Document): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const body = doc.body;
  if (!body) return diagnostics;

  const allElements = body.querySelectorAll('*');

  Array.from(allElements).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) {
      const parent = el.parentNode;
      if (!parent) {
        el.remove();
      } else {
        const text = doc.createTextNode(el.textContent ?? '');
        parent.replaceChild(text, el);
      }
      diagnostics.push({
        level: 'warning',
        message: `移除了不支持的标签: <${tag}>`,
        source: 'sanitizer',
      });
      return;
    }

    const attrsToRemove: string[] = [];
    Array.from(el.attributes).forEach((attr) => {
      if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
        attrsToRemove.push(attr.name);
      }
    });
    attrsToRemove.forEach((attrName) => {
      el.removeAttribute(attrName);
    });
  });

  const bodyAttrsToRemove: string[] = [];
  Array.from(body.attributes).forEach((attr) => {
    if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
      bodyAttrsToRemove.push(attr.name);
    }
  });
  bodyAttrsToRemove.forEach((attrName) => body.removeAttribute(attrName));

  return diagnostics;
}

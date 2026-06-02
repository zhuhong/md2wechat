import type {
  Theme,
  HeadingStyle,
  TextStyle,
  BlockquoteStyle,
  CodeStyle,
  CodeBlockStyle,
  TableStyle,
  LinkStyle,
  ImageStyle,
  HRStyle,
  ListStyle,
} from './types.js';

/**
 * Convert a camelCase key to kebab-case CSS property name
 */
function toKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Convert a style object to an inline CSS string
 */
function styleToString(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${toKebab(k)}: ${v};`)
    .join(' ');
}

/**
 * Render theme tokens to inline CSS for a given HTML tag
 */
export function renderTagStyle(theme: Theme, tag: string): string {
  switch (tag) {
    case 'body':
    case 'div': {
      const b = theme.body;
      return styleToString({
        fontFamily: b.fontFamily,
        fontSize: b.fontSize,
        lineHeight: b.lineHeight,
        color: b.color,
        backgroundColor: b.backgroundColor,
        padding: b.padding,
        maxWidth: b.maxWidth,
        margin: '0 auto',
        wordWrap: 'break-word',
      });
    }
    case 'h1':
      return renderHeadingStyle(theme.headings.h1);
    case 'h2':
      return renderHeadingStyle(theme.headings.h2);
    case 'h3':
      return renderHeadingStyle(theme.headings.h3);
    case 'h4':
      return renderHeadingStyle(theme.headings.h4);
    case 'h5':
      return renderHeadingStyle(theme.headings.h5);
    case 'h6':
      return renderHeadingStyle(theme.headings.h6);
    case 'p':
      return renderTextStyle(theme.paragraph);
    case 'blockquote':
      return renderBlockquoteStyle(theme.blockquote);
    case 'code':
      return renderCodeStyle(theme.code.inline);
    case 'pre':
      return renderCodeBlockStyle(theme.code.block);
    case 'table':
      return renderTableStyle(theme.table);
    case 'th':
      return renderTableThStyle(theme.table);
    case 'td':
      return renderTableTdStyle(theme.table);
    case 'a':
      return renderLinkStyle(theme.link);
    case 'img':
      return renderImageStyle(theme.image);
    case 'hr':
      return renderHRStyle(theme.hr);
    case 'ul':
    case 'ol':
      return renderListStyle(theme.list);
    case 'li':
      return styleToString({ margin: theme.list.itemMargin });
    default:
      return '';
  }
}

function renderHeadingStyle(h: HeadingStyle): string {
  return styleToString({
    fontSize: h.fontSize,
    fontWeight: h.fontWeight,
    color: h.color,
    lineHeight: h.lineHeight,
    letterSpacing: h.letterSpacing,
    textAlign: h.textAlign,
    borderBottom: h.borderBottom,
    marginTop: h.marginTop,
    marginBottom: h.marginBottom,
  });
}

function renderTextStyle(t: TextStyle): string {
  return styleToString({
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    color: t.color,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
  });
}

function renderBlockquoteStyle(b: BlockquoteStyle): string {
  return styleToString({
    borderLeft: b.borderLeft,
    paddingLeft: b.paddingLeft,
    color: b.color,
    backgroundColor: b.backgroundColor,
    fontStyle: b.fontStyle,
    margin: b.margin,
    padding: b.padding,
    borderRadius: b.borderRadius,
  });
}

function renderCodeStyle(c: CodeStyle): string {
  return styleToString({
    fontSize: c.fontSize,
    fontWeight: c.fontWeight,
    color: c.color,
    lineHeight: c.lineHeight,
    letterSpacing: c.letterSpacing,
    backgroundColor: c.backgroundColor,
    padding: c.padding,
    borderRadius: c.borderRadius,
    fontFamily: c.fontFamily,
  });
}

function renderCodeBlockStyle(c: CodeBlockStyle): string {
  return styleToString({
    fontSize: c.fontSize,
    fontWeight: c.fontWeight,
    color: c.color,
    lineHeight: c.lineHeight,
    letterSpacing: c.letterSpacing,
    backgroundColor: c.backgroundColor,
    padding: c.padding,
    borderRadius: c.borderRadius,
    fontFamily: c.fontFamily,
    overflowX: c.overflowX,
    whiteSpace: c.whiteSpace,
  });
}

function renderTableStyle(t: TableStyle): string {
  return styleToString({
    borderCollapse: t.borderCollapse,
    width: t.width,
    border: t.border,
    margin: t.margin,
  });
}

function renderTableThStyle(t: TableStyle): string {
  return styleToString({
    border: t.thBorder ?? t.border,
    padding: t.thPadding,
    backgroundColor: t.thBackgroundColor,
    color: t.thColor,
    fontWeight: 600,
    textAlign: 'left',
  });
}

function renderTableTdStyle(t: TableStyle): string {
  return styleToString({
    border: t.tdBorder ?? t.border,
    padding: t.tdPadding,
    backgroundColor: t.tdBackgroundColor,
  });
}

function renderLinkStyle(l: LinkStyle): string {
  return styleToString({
    color: l.color,
    textDecoration: l.textDecoration,
    fontWeight: l.fontWeight,
  });
}

function renderImageStyle(i: ImageStyle): string {
  return styleToString({
    maxWidth: i.maxWidth,
    height: i.height,
    display: i.display,
    margin: i.margin,
    borderRadius: i.borderRadius,
  });
}

function renderHRStyle(h: HRStyle): string {
  return styleToString({
    border: h.border,
    margin: h.margin,
    borderTop: h.borderTop,
  });
}

function renderListStyle(l: ListStyle): string {
  return styleToString({
    margin: l.margin,
    paddingLeft: l.paddingLeft,
  });
}

/**
 * Apply theme tokens as inline styles to all matching elements in an HTML document.
 */
export function applyThemeToDocument(doc: Document, theme: Theme): void {
  const allElements = doc.querySelectorAll('*');
  Array.from(allElements).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const inlineStyle = renderTagStyle(theme, tag);
    if (inlineStyle) {
      const existing = el.getAttribute('style') ?? '';
      const combined = existing
        ? `${existing.trim().replace(/;?$/, '; ')}${inlineStyle}`
        : inlineStyle;
      el.setAttribute('style', combined);
    }
  });

  const body = doc.body;
  if (body) {
    const bodyStyle = renderTagStyle(theme, 'body');
    const existing = body.getAttribute('style') ?? '';
    const combined = existing
      ? `${existing.trim().replace(/;?$/, '; ')}${bodyStyle}`
      : bodyStyle;
    body.setAttribute('style', combined);
  }
}

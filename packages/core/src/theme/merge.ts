import type { Theme, HeadingStyle } from './types.js';

export interface ThemeOverrides {
  fontSize?: number;
  lineHeight?: number;
  primaryTextColor?: string;
  linkColor?: string;
  codeColor?: string;
  paragraphMargin?: number;
  headingMargin?: number;
}

/**
 * Merge a base theme preset with user overrides from the theme panel.
 */
export function mergeThemePresetWithOverrides(
  baseTheme: Theme,
  overrides?: ThemeOverrides
): Theme {
  if (!overrides || Object.keys(overrides).length === 0) return baseTheme;

  const baseFontSize = parseInt(baseTheme.body.fontSize, 10) || 16;
  const scale = overrides.fontSize ? overrides.fontSize / baseFontSize : 1;

  return {
    ...baseTheme,
    body: {
      ...baseTheme.body,
      fontSize: overrides.fontSize ? `${overrides.fontSize}px` : baseTheme.body.fontSize,
      lineHeight: overrides.lineHeight ?? baseTheme.body.lineHeight,
      color: overrides.primaryTextColor ?? baseTheme.body.color,
    },
    paragraph: {
      ...baseTheme.paragraph,
      fontSize: overrides.fontSize ? `${overrides.fontSize}px` : baseTheme.paragraph.fontSize,
      lineHeight: overrides.lineHeight ?? baseTheme.paragraph.lineHeight,
      color: overrides.primaryTextColor ?? baseTheme.paragraph.color,
      marginTop: overrides.paragraphMargin
        ? `${overrides.paragraphMargin}px`
        : baseTheme.paragraph.marginTop,
      marginBottom: overrides.paragraphMargin
        ? `${overrides.paragraphMargin}px`
        : baseTheme.paragraph.marginBottom,
    },
    headings: {
      h1: scaleHeading(baseTheme.headings.h1, scale, overrides),
      h2: scaleHeading(baseTheme.headings.h2, scale, overrides),
      h3: scaleHeading(baseTheme.headings.h3, scale, overrides),
      h4: scaleHeading(baseTheme.headings.h4, scale, overrides),
      h5: scaleHeading(baseTheme.headings.h5, scale, overrides),
      h6: scaleHeading(baseTheme.headings.h6, scale, overrides),
    },
    blockquote: {
      ...baseTheme.blockquote,
      color: overrides.primaryTextColor ?? baseTheme.blockquote.color,
    },
    link: {
      ...baseTheme.link,
      color: overrides.linkColor ?? baseTheme.link.color,
    },
    code: {
      inline: {
        ...baseTheme.code.inline,
        color: overrides.codeColor ?? baseTheme.code.inline.color,
      },
      block: {
        ...baseTheme.code.block,
        color: overrides.codeColor ?? baseTheme.code.block.color,
      },
    },
  };
}

function scaleHeading(
  base: HeadingStyle,
  scale: number,
  overrides: ThemeOverrides
): HeadingStyle {
  const scaledSize = base.fontSize
    ? `${Math.max(12, Math.round((parseInt(base.fontSize, 10) || 16) * scale))}px`
    : base.fontSize;

  return {
    ...base,
    fontSize: scaledSize,
    lineHeight: overrides.lineHeight ?? base.lineHeight,
    color: overrides.primaryTextColor ?? base.color,
    marginTop: overrides.headingMargin
      ? `${overrides.headingMargin}px`
      : base.marginTop,
    marginBottom: overrides.headingMargin
      ? `${overrides.headingMargin}px`
      : base.marginBottom,
  };
}

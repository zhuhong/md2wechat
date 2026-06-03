export interface Theme {
  id: string;
  name: string;
  author?: string;
  description?: string;

  /** Global body styles */
  body: BodyStyle;

  /** Heading styles h1-h6 */
  headings: {
    h1: HeadingStyle;
    h2: HeadingStyle;
    h3: HeadingStyle;
    h4: HeadingStyle;
    h5: HeadingStyle;
    h6: HeadingStyle;
  };

  /** Paragraph styles */
  paragraph: TextStyle;

  /** Blockquote styles */
  blockquote: BlockquoteStyle;

  /** Code styles (inline and block) */
  code: {
    inline: CodeStyle;
    block: CodeBlockStyle;
  };

  /** Table styles */
  table: TableStyle;

  /** Link styles */
  link: LinkStyle;

  /** Image styles */
  image: ImageStyle;

  /** Horizontal rule styles */
  hr: HRStyle;

  /** List styles */
  list: ListStyle;
}

export interface BodyStyle {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  color: string;
  backgroundColor: string;
  padding: string;
  maxWidth: string;
}

export interface TextStyle {
  fontSize?: string;
  fontWeight?: string | number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface HeadingStyle extends TextStyle {
  textAlign?: 'left' | 'center' | 'right';
  borderBottom?: string;
  marginTop?: string;
  marginBottom?: string;
}

export interface BlockquoteStyle {
  borderLeft: string;
  paddingLeft: string;
  color: string;
  backgroundColor?: string;
  fontStyle?: 'normal' | 'italic';
  margin?: string;
  padding?: string;
  borderRadius?: string;
}

export interface CodeStyle extends TextStyle {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  fontFamily?: string;
}

export interface CodeBlockStyle extends CodeStyle {
  overflowX?: string;
  whiteSpace?: string;
}

export interface TableStyle {
  borderCollapse: string;
  width: string;
  border?: string;
  margin?: string;
  thBackgroundColor?: string;
  thColor?: string;
  thPadding?: string;
  thBorder?: string;
  tdPadding?: string;
  tdBorder?: string;
  tdBackgroundColor?: string;
}

export interface LinkStyle {
  color: string;
  textDecoration?: string;
  fontWeight?: string | number;
}

export interface ImageStyle {
  maxWidth: string;
  height: string;
  display: string;
  margin: string;
  borderRadius?: string;
}

export interface HRStyle {
  border: string;
  margin?: string;
  borderTop?: string;
}

export interface ListStyle {
  margin?: string;
  paddingLeft?: string;
  itemMargin?: string;
  markerColor?: string;
}

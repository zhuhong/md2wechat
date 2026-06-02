import type { Theme } from '../types.js';

export const minimalTheme: Theme = {
  id: 'minimal',
  name: '极简',
  author: 'md2wechat',
  description: '极度简洁的排版主题，去除多余装饰',

  body: {
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    padding: '1em',
    maxWidth: '677px',
  },

  headings: {
    h1: {
      fontSize: '22px',
      fontWeight: 600,
      color: '#111111',
      textAlign: 'left',
      marginTop: '1.5em',
      marginBottom: '0.75em',
      lineHeight: 1.4,
    },
    h2: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#222222',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      borderBottom: 'none',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#333333',
      marginTop: '1.2em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#444444',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '15px',
      fontWeight: 500,
      color: '#555555',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#666666',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
  },

  paragraph: {
    fontSize: '15px',
    fontWeight: 400,
    color: '#1a1a1a',
    lineHeight: 1.8,
    letterSpacing: '0.01em',
  },

  blockquote: {
    borderLeft: '3px solid #dddddd',
    paddingLeft: '1em',
    color: '#555555',
    backgroundColor: 'transparent',
    fontStyle: 'normal',
    margin: '1em 0',
    padding: '0.5em 1em',
    borderRadius: '0',
  },

  code: {
    inline: {
      fontSize: '0.85em',
      fontWeight: 400,
      color: '#e83e8c',
      backgroundColor: '#f5f5f5',
      padding: '0.15em 0.35em',
      borderRadius: '3px',
      fontFamily: '"SFMono-Regular", Consolas, Menlo, monospace',
    },
    block: {
      fontSize: '13px',
      fontWeight: 400,
      color: '#1a1a1a',
      lineHeight: 1.65,
      backgroundColor: '#f8f8f8',
      padding: '1em',
      borderRadius: '4px',
      fontFamily: '"SFMono-Regular", Consolas, Menlo, monospace',
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
  },

  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #eeeeee',
    margin: '1em 0',
    thBackgroundColor: '#fafafa',
    thColor: '#111111',
    thPadding: '8px 12px',
    thBorder: '1px solid #eeeeee',
    tdPadding: '8px 12px',
    tdBorder: '1px solid #eeeeee',
    tdBackgroundColor: '#ffffff',
  },

  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 400,
  },

  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '1em auto',
    borderRadius: '0px',
  },

  hr: {
    border: 'none',
    margin: '1.5em 0',
    borderTop: '1px solid #eeeeee',
  },

  list: {
    margin: '1em 0',
    paddingLeft: '1.5em',
    itemMargin: '0.25em 0',
    markerColor: '#333333',
  },
};

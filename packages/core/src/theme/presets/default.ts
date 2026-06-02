import type { Theme } from '../types.js';

export const defaultTheme: Theme = {
  id: 'default',
  name: '默认主题',
  author: 'md2wechat',
  description: '适合微信公众号的简洁默认主题',

  body: {
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    fontSize: '16px',
    lineHeight: 1.75,
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: '1em',
    maxWidth: '677px',
  },

  headings: {
    h1: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#333333',
      textAlign: 'center',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h2: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#333333',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      borderBottom: '1px solid #eeeeee',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#444444',
      marginTop: '1.2em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#555555',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#555555',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#666666',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
  },

  paragraph: {
    fontSize: '16px',
    fontWeight: 400,
    color: '#333333',
    lineHeight: 1.75,
    letterSpacing: '0.02em',
  },

  blockquote: {
    borderLeft: '4px solid #cbd5e1',
    paddingLeft: '1em',
    color: '#666666',
    backgroundColor: '#f8f9fa',
    fontStyle: 'normal',
    margin: '1em 0',
    padding: '0.75em 1em',
    borderRadius: '0 4px 4px 0',
  },

  code: {
    inline: {
      fontSize: '0.875em',
      fontWeight: 400,
      color: '#c7254e',
      backgroundColor: '#f9f2f4',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    },
    block: {
      fontSize: '14px',
      fontWeight: 400,
      color: '#333333',
      lineHeight: 1.6,
      backgroundColor: '#f6f8fa',
      padding: '1em',
      borderRadius: '6px',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
  },

  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #e0e0e0',
    margin: '1em 0',
    thBackgroundColor: '#f5f5f5',
    thColor: '#333333',
    thPadding: '8px 12px',
    thBorder: '1px solid #e0e0e0',
    tdPadding: '8px 12px',
    tdBorder: '1px solid #e0e0e0',
    tdBackgroundColor: '#ffffff',
  },

  link: {
    color: '#0366d6',
    textDecoration: 'none',
    fontWeight: 500,
  },

  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '1em auto',
    borderRadius: '4px',
  },

  hr: {
    border: 'none',
    margin: '1.5em 0',
    borderTop: '1px solid #e0e0e0',
  },

  list: {
    margin: '1em 0',
    paddingLeft: '1.5em',
    itemMargin: '0.25em 0',
    markerColor: '#333333',
  },
};

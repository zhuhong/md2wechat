import type { Theme } from '../types.js';

export const techTheme: Theme = {
  id: 'tech',
  name: '科技风',
  author: 'md2wechat',
  description: '适合技术博客的深色代码块与蓝色强调主题',

  body: {
    fontFamily: '"SF Pro SC", "SF Pro Text", "SF Pro Icons", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    fontSize: '15px',
    lineHeight: 1.8,
    color: '#2d3748',
    backgroundColor: '#ffffff',
    padding: '1em',
    maxWidth: '677px',
  },

  headings: {
    h1: {
      fontSize: '26px',
      fontWeight: 700,
      color: '#1a202c',
      textAlign: 'center',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h2: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#2b6cb0',
      marginTop: '1.5em',
      marginBottom: '0.5em',
      borderBottom: '2px solid #bee3f8',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#2c5282',
      marginTop: '1.2em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '15px',
      fontWeight: 600,
      color: '#3182ce',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#4a5568',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '13px',
      fontWeight: 600,
      color: '#718096',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
  },

  paragraph: {
    fontSize: '15px',
    fontWeight: 400,
    color: '#2d3748',
    lineHeight: 1.8,
    letterSpacing: '0.01em',
  },

  blockquote: {
    borderLeft: '4px solid #4299e1',
    paddingLeft: '1em',
    color: '#4a5568',
    backgroundColor: '#ebf8ff',
    fontStyle: 'normal',
    margin: '1em 0',
    padding: '0.75em 1em',
    borderRadius: '0 4px 4px 0',
  },

  code: {
    inline: {
      fontSize: '0.875em',
      fontWeight: 500,
      color: '#e2e8f0',
      backgroundColor: '#2d3748',
      padding: '0.2em 0.4em',
      borderRadius: '4px',
      fontFamily: '"JetBrains Mono", "Fira Code", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    },
    block: {
      fontSize: '13px',
      fontWeight: 400,
      color: '#e2e8f0',
      lineHeight: 1.7,
      backgroundColor: '#1a202c',
      padding: '1em',
      borderRadius: '6px',
      fontFamily: '"JetBrains Mono", "Fira Code", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
  },

  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #e2e8f0',
    margin: '1em 0',
    thBackgroundColor: '#ebf8ff',
    thColor: '#2b6cb0',
    thPadding: '8px 12px',
    thBorder: '1px solid #bee3f8',
    tdPadding: '8px 12px',
    tdBorder: '1px solid #e2e8f0',
    tdBackgroundColor: '#ffffff',
  },

  link: {
    color: '#3182ce',
    textDecoration: 'none',
    fontWeight: 500,
  },

  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '1em auto',
    borderRadius: '6px',
  },

  hr: {
    border: 'none',
    margin: '1.5em 0',
    borderTop: '1px solid #e2e8f0',
  },

  list: {
    margin: '1em 0',
    paddingLeft: '1.5em',
    itemMargin: '0.25em 0',
    markerColor: '#3182ce',
  },
};

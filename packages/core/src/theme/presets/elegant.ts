import type { Theme } from '../types.js';

export const elegantTheme: Theme = {
  id: 'elegant',
  name: '优雅杂志',
  author: 'md2wechat',
  description: '适合长文阅读的优雅杂志风主题，衬线字体与暖色调',

  body: {
    fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "SimSun", "Georgia", serif',
    fontSize: '16px',
    lineHeight: 1.85,
    color: '#3d3d3d',
    backgroundColor: '#faf9f7',
    padding: '1em',
    maxWidth: '677px',
  },

  headings: {
    h1: {
      fontSize: '26px',
      fontWeight: 700,
      color: '#2c2c2c',
      textAlign: 'center',
      marginTop: '1.5em',
      marginBottom: '0.75em',
      lineHeight: 1.3,
    },
    h2: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#3d3d3d',
      marginTop: '1.5em',
      marginBottom: '0.75em',
      borderBottom: '1px solid #e8e4df',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '17px',
      fontWeight: 600,
      color: '#4a4a4a',
      marginTop: '1.3em',
      marginBottom: '0.6em',
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
      color: '#666666',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#777777',
      marginTop: '1em',
      marginBottom: '0.5em',
      lineHeight: 1.4,
    },
  },

  paragraph: {
    fontSize: '16px',
    fontWeight: 400,
    color: '#3d3d3d',
    lineHeight: 1.85,
    letterSpacing: '0.02em',
  },

  blockquote: {
    borderLeft: '3px solid #c9a87c',
    paddingLeft: '1em',
    color: '#6b5b4e',
    backgroundColor: '#f5f2ee',
    fontStyle: 'italic',
    margin: '1.5em 0',
    padding: '1em 1.25em',
    borderRadius: '0 4px 4px 0',
  },

  code: {
    inline: {
      fontSize: '0.85em',
      fontWeight: 400,
      color: '#8b5e3c',
      backgroundColor: '#f3efe9',
      padding: '0.2em 0.4em',
      borderRadius: '3px',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    },
    block: {
      fontSize: '13px',
      fontWeight: 400,
      color: '#4a4a4a',
      lineHeight: 1.65,
      backgroundColor: '#f3efe9',
      padding: '1em',
      borderRadius: '4px',
      fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
  },

  table: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #e8e4df',
    margin: '1.5em 0',
    thBackgroundColor: '#f5f2ee',
    thColor: '#4a4a4a',
    thPadding: '10px 14px',
    thBorder: '1px solid #e8e4df',
    tdPadding: '10px 14px',
    tdBorder: '1px solid #e8e4df',
    tdBackgroundColor: '#faf9f7',
  },

  link: {
    color: '#8b5e3c',
    textDecoration: 'none',
    fontWeight: 500,
  },

  image: {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    margin: '1.5em auto',
    borderRadius: '4px',
  },

  hr: {
    border: 'none',
    margin: '2em 0',
    borderTop: '1px solid #e8e4df',
  },

  list: {
    margin: '1em 0',
    paddingLeft: '1.75em',
    itemMargin: '0.35em 0',
    markerColor: '#c9a87c',
  },
};

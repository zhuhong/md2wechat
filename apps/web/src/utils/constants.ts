export const APP_NAME = 'md2wechat'
export const WECHAT_ARTICLE_WIDTH = 375 // px, simulated mobile width
export const DEFAULT_MARKDOWN = `# Hello md2wechat

这是一个专为微信公众号排版的 Markdown 编辑器。

## Features
- 实时预览
- 微信兼容样式
- 一键复制
`

export const STORAGE_KEYS = {
  EDITOR_CONTENT: 'md2wechat:draft',
  SETTINGS: 'md2wechat:settings',
} as const

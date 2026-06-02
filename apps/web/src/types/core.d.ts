declare module '@md2wechat/core' {
  export function renderToWechatHTML(
    markdown: string,
    options?: { theme?: string }
  ): Promise<string>

  export function renderMarkdown(markdown: string): Promise<{
    previewHtml: string
    clipboardHtml: string
    plainText: string
    assets: unknown[]
    diagnostics: unknown[]
  }>
}

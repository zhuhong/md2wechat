import WechatPreview from './WechatPreview'

export default function PreviewPane() {
  return (
    <div className="h-full w-full bg-muted/40 flex items-start justify-center overflow-auto p-4">
      <WechatPreview />
    </div>
  )
}

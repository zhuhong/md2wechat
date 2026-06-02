import Toolbar from '@/components/toolbar/Toolbar'
import SplitPane from './SplitPane'
import MarkdownEditor from '@/components/editor/MarkdownEditor'
import PreviewPane from '@/components/preview/PreviewPane'
import ThemePanel from '@/components/theme/ThemePanel'

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <Toolbar />
      <div className="flex-1 min-h-0">
        <SplitPane left={<MarkdownEditor />} right={<PreviewPane />} />
      </div>
      <ThemePanel />
    </div>
  )
}

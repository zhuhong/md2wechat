import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/stores/editorStore'
import { useThemeStore } from '@/stores/themeStore'
import { EditorView, keymap, lineNumbers } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { oneDark } from '@codemirror/theme-one-dark'
import { bracketMatching } from '@codemirror/language'

function wrapSelection(view: EditorView, before: string, after: string = before) {
  const { from, to } = view.state.selection.main;
  const text = view.state.doc.sliceString(from, to) || 'text';
  const newText = before + text + after;
  view.dispatch({
    changes: { from, to, insert: newText },
    selection: { anchor: from + before.length, head: from + before.length + text.length },
  });
  return true;
}

function toggleHeading(view: EditorView, level: number) {
  const { state } = view;
  const { from, to } = state.selection.main;
  const startLine = state.doc.lineAt(from);
  const endLine = state.doc.lineAt(to);

  const changes = [];
  for (let i = startLine.number; i <= endLine.number; i++) {
    const line = state.doc.line(i);
    const match = line.text.match(/^(#{1,6})\s+/);
    let newText: string;
    if (match) {
      newText = '#'.repeat(level) + ' ' + line.text.slice(match[0].length);
    } else {
      newText = '#'.repeat(level) + ' ' + line.text;
    }
    changes.push({ from: line.from, to: line.to, insert: newText });
  }

  view.dispatch({ changes });
  return true;
}

export default function MarkdownEditor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const { content, setContent, loadDraft } = useEditorStore()
  const { mode } = useThemeStore()
  const lastExternalContentRef = useRef<string>(content)

  const createExtensions = (_doc: string, onChange: (v: string) => void, isDark: boolean) => {
    const base = [
      lineNumbers(),
      history(),
      bracketMatching(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap,
        {
          key: 'Mod-b',
          run: (view) => wrapSelection(view, '**'),
        },
        {
          key: 'Mod-i',
          run: (view) => wrapSelection(view, '*'),
        },
        {
          key: 'Mod-k',
          run: (view) => {
            const url = window.prompt('输入链接地址:');
            if (!url) return false;
            wrapSelection(view, '[', `](${url})`);
            return true;
          },
        },
        {
          key: 'Mod-1',
          run: (view) => toggleHeading(view, 1),
        },
        {
          key: 'Mod-2',
          run: (view) => toggleHeading(view, 2),
        },
        {
          key: 'Mod-3',
          run: (view) => toggleHeading(view, 3),
        },
        {
          key: 'Mod-4',
          run: (view) => toggleHeading(view, 4),
        },
        {
          key: 'Mod-5',
          run: (view) => toggleHeading(view, 5),
        },
        {
          key: 'Mod-6',
          run: (view) => toggleHeading(view, 6),
        },
      ]),
      markdown(),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': { height: '100%' },
        '.cm-scroller': { overflow: 'auto' },
        '.cm-content': {
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        },
      }),
    ]
    if (isDark) base.push(oneDark)
    return base
  }

  useEffect(() => {
    if (!containerRef.current || viewRef.current) return

    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    const state = EditorState.create({
      doc: useEditorStore.getState().content,
      extensions: createExtensions(
        useEditorStore.getState().content,
        setContent,
        isDark
      ),
    })

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    })

    // Load draft from IndexedDB after editor initialized
    loadDraft()

    return () => {
      viewRef.current?.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentDoc = view.state.doc.toString()
    if (content !== currentDoc) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: content },
        selection: { anchor: 0 },
      })
      lastExternalContentRef.current = content
    }
  }, [content])

  useEffect(() => {
    const view = viewRef.current
    if (!view || !containerRef.current) return

    const currentDoc = view.state.doc.toString()
    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    view.destroy()

    const state = EditorState.create({
      doc: currentDoc,
      extensions: createExtensions(currentDoc, setContent, isDark),
    })

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    })
  }, [mode, setContent])

  return (
    <div className="h-full w-full bg-background flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  )
}

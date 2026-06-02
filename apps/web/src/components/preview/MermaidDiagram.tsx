import { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

export default function MermaidDiagram({ code, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    if (!containerRef.current) return;
    mermaid.initialize({ startOnLoad: false });

    mermaid
      .render(`mermaid-diagram-${id}`, code)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err: Error) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color:red">Mermaid error: ${err.message}</div>`;
        }
      });
  }, [code, id]);

  return <div ref={containerRef} className={className} />;
}

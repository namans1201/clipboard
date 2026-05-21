'use client';

/**
 * MermaidDiagram — render a mermaid source string as SVG.
 *
 * Mermaid is a large client-only library. We import it dynamically the
 * first time the component mounts so it never lands in the initial
 * dashboard bundle — clips that aren't .mmd / mermaid never pay this cost.
 *
 * Theme follows next-themes: light → mermaid's default light theme,
 * dark → its dark theme. Re-renders on theme switch so the diagram
 * doesn't get stranded in the wrong palette.
 *
 * Parse errors fall back to a raw <pre> view of the source — so a
 * mistyped diagram still shows useful content instead of a blank box.
 */

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface MermaidDiagramProps {
  code: string;
  className?: string;
}

// Each diagram needs a unique id so mermaid's internal cache doesn't
// collide if two diagrams render at the same time.
let nextDiagramId = 0;
function useUniqueId() {
  const [id] = useState(() => `mermaid-${++nextDiagramId}`);
  return id;
}

export function MermaidDiagram({ code, className }: MermaidDiagramProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const id = useUniqueId();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaidMod = await import('mermaid');
        const mermaid = mermaidMod.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: isDark ? 'dark' : 'default',
        });
        const { svg } = await mermaid.render(`${id}-svg`, code);
        if (cancelled) return;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to render diagram');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, isDark, id]);

  if (error) {
    return (
      <div className={className}>
        <div className="text-xs text-destructive mb-1 px-3 pt-3">
          Mermaid render error — showing source:
        </div>
        <pre className="text-xs font-mono whitespace-pre-wrap px-3 pb-3">
          {code}
        </pre>
      </div>
    );
  }

  // The SVG is injected via innerHTML inside the useEffect. The wrapping
  // div carries the className so callers can constrain max-height etc.
  return <div ref={containerRef} className={className} />;
}

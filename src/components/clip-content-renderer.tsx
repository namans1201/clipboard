'use client';

/**
 * ClipContentRenderer — single entry point that dispatches a clip's
 * content to the right renderer based on its filename (title).
 *
 *   inferKind(title) → 'mermaid'  → MermaidDiagram
 *                    → 'markdown' → MarkdownView
 *                    → 'code'     → CodeBlock
 *                    → 'text'     → raw <pre> (existing behaviour)
 *
 * Used by ClipCard's non-compact preview AND ClipEditor's view mode. The
 * `maxHeight` prop controls the wrapping scroll container — the card
 * passes "9rem" (was `max-h-36`), the editor passes "400px"
 * (was `max-h-[400px]`).
 */

import { cn } from '@/lib/utils';
import { inferKind, inferLanguage } from '@/lib/clip-language';
import { CodeBlock } from './clip-renderers/code-block';
import { MarkdownView } from './clip-renderers/markdown-view';
import { MermaidDiagram } from './clip-renderers/mermaid-diagram';

interface ClipContentRendererProps {
  title: string | null | undefined;
  content: string;
  /**
   * CSS max-height for the scrollable wrapper. Anything tailwind-y
   * (`9rem`, `400px`, `60vh`). Defaults to no constraint.
   */
  maxHeight?: string;
  className?: string;
}

export function ClipContentRenderer({
  title,
  content,
  maxHeight,
  className,
}: ClipContentRendererProps) {
  const kind = inferKind(title);

  const wrapperClass = cn(
    'bg-muted/50 rounded p-0 overflow-auto',
    className,
  );
  const wrapperStyle = maxHeight ? { maxHeight } : undefined;

  if (kind === 'mermaid') {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <MermaidDiagram code={content} className="p-3" />
      </div>
    );
  }

  if (kind === 'markdown') {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <MarkdownView content={content} />
      </div>
    );
  }

  if (kind === 'code') {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <CodeBlock code={content} language={inferLanguage(title)} />
      </div>
    );
  }

  // Plain text — keep the exact look from the previous implementation
  // (monospace, pre-wrap) so titleless clips look unchanged.
  return (
    <pre
      className={cn(
        'whitespace-pre-wrap break-words text-sm font-mono p-3 bg-muted/50 rounded overflow-auto',
        className,
      )}
      style={wrapperStyle}
    >
      {content}
    </pre>
  );
}

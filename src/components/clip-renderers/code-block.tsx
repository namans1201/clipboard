'use client';

/**
 * CodeBlock — Prism-based syntax-highlighted code rendering.
 *
 * Uses react-syntax-highlighter's PrismLight build (smaller bundle than
 * the default; we register only the languages our clip-language helper
 * maps to). Theme is keyed off next-themes so highlight colours flip
 * between oneLight and oneDark with the app's dark-mode toggle.
 *
 * Languages registered here must stay in sync with EXT_TO_PRISM in
 * src/lib/clip-language.ts — if you add a new extension there, register
 * the matching Prism language module here too.
 */

import { useTheme } from 'next-themes';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneLight,
  oneDark,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// Language modules — keep this list in lock-step with EXT_TO_PRISM
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);

interface CodeBlockProps {
  /** Plain source code to render. */
  code: string;
  /**
   * Prism language id (e.g., "python"). When unset or unknown, Prism
   * falls back to its `text` rendering — still readable, just unstyled.
   */
  language?: string | null;
  /**
   * Optional className to merge with the highlighter's pre wrapper.
   * Used by callers to control max-height / overflow.
   */
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <SyntaxHighlighter
      language={language ?? 'text'}
      style={isDark ? oneDark : oneLight}
      // We control max-height + overflow from the parent, so don't let
      // the highlighter set its own padding/margin defaults that would
      // double up against the card.
      customStyle={{
        margin: 0,
        padding: '0.75rem',
        background: 'transparent',
        fontSize: '0.8125rem',
        lineHeight: 1.45,
        borderRadius: 0,
      }}
      // PreTag/CodeTag get the className so the parent's max-h-* /
      // overflow-auto / rounded utilities apply cleanly.
      PreTag={(props) => <pre {...props} className={className} />}
      wrapLongLines={false}
    >
      {code}
    </SyntaxHighlighter>
  );
}

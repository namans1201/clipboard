/**
 * clip-language — derive rendering hints (kind, Prism language id, MIME)
 * from a clip's `title`. The title acts as the filename when it ends in
 * a recognised extension; otherwise the clip is treated as plain text.
 *
 * Kept dependency-free so it can be imported from both client and server
 * components. Languages registered here must match what code-block.tsx
 * registers with react-syntax-highlighter — if you add a new language
 * keep the two in sync.
 */

export type ClipKind = 'code' | 'markdown' | 'mermaid' | 'text';

/**
 * Return the lowercased extension (without leading dot) of `title`, or
 * null if there's no extension or the title is empty. Treats a title
 * like ".env" as no-extension (a leading-dot file with no further dots
 * is by convention a config file, but we don't have a renderer for it,
 * so falling through to text is fine).
 */
export function getExtension(title: string | null | undefined): string | null {
  if (!title) return null;
  const trimmed = title.trim();
  if (!trimmed) return null;
  const lastDot = trimmed.lastIndexOf('.');
  // No dot, or dot is the first character (e.g. ".env"), or trailing dot.
  if (lastDot <= 0 || lastDot === trimmed.length - 1) return null;
  return trimmed.slice(lastDot + 1).toLowerCase();
}

/**
 * Map of file extensions to Prism language identifiers (as registered in
 * code-block.tsx). The keys here ARE the set of "this is code" extensions
 * — anything not in the map falls through to text/markdown/mermaid checks.
 */
const EXT_TO_PRISM: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  json: 'json',
  css: 'css',
  scss: 'scss',
  html: 'markup',
  xml: 'markup',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  sql: 'sql',
  go: 'go',
  rs: 'rust',
  yml: 'yaml',
  yaml: 'yaml',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  hpp: 'cpp',
  cs: 'csharp',
  rb: 'ruby',
  php: 'php',
  swift: 'swift',
  kt: 'kotlin',
};

const MARKDOWN_EXTS = new Set(['md', 'markdown', 'mdown', 'mkd']);
const MERMAID_EXTS = new Set(['mmd', 'mermaid']);

/**
 * Strong, unambiguous markers that say "this body is markdown" even when
 * the title gives no hint (e.g. a clip pasted from a chat). Kept narrow
 * so plain prose doesn't get reformatted by mistake:
 *  - GFM table separator row (`| --- | --- |`), only meaningful in tables
 *  - fenced code block (```)
 *  - ATX heading (`# …`) — false-positive risk is bounded by the
 *    title-based path already catching `.py` etc. as code
 */
const GFM_TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/m;
const FENCED_CODE_BLOCK = /^\s*```/m;
const ATX_HEADING = /^#{1,6}\s+\S/m;

export function looksLikeMarkdown(content: string | null | undefined): boolean {
  if (!content) return false;
  return (
    GFM_TABLE_SEPARATOR.test(content) ||
    FENCED_CODE_BLOCK.test(content) ||
    ATX_HEADING.test(content)
  );
}

/**
 * Decide which renderer should handle a clip. Returns:
 *  - 'mermaid'  → flow/sequence/etc. diagram (rendered as SVG)
 *  - 'markdown' → headings/lists/etc. (fenced code blocks get highlighted)
 *  - 'code'     → syntax-highlighted via Prism
 *  - 'text'     → raw `<pre>` (the existing behaviour, also the fallback)
 *
 * If `content` is supplied and the title doesn't classify the clip, we
 * sniff the body for unambiguous markdown markers before falling back to
 * plain text — that's what catches title-less pasted tables.
 */
export function inferKind(
  title: string | null | undefined,
  content?: string | null,
): ClipKind {
  const ext = getExtension(title);
  if (ext) {
    if (MERMAID_EXTS.has(ext)) return 'mermaid';
    if (MARKDOWN_EXTS.has(ext)) return 'markdown';
    if (ext in EXT_TO_PRISM) return 'code';
  }
  if (looksLikeMarkdown(content)) return 'markdown';
  return 'text';
}

/**
 * Return the Prism language id for a clip's title, or null if the
 * extension isn't one of our registered languages. Caller is expected
 * to fall back to plain `<pre>` rendering for null.
 */
export function inferLanguage(title: string | null | undefined): string | null {
  const ext = getExtension(title);
  if (!ext) return null;
  return EXT_TO_PRISM[ext] ?? null;
}

/**
 * MIME-type lookup for the download helper. Falls back to text/plain
 * for any unknown extension (browsers and OSes still associate by
 * filename extension in that case, so the download still works).
 */
const MIME_BY_EXT: Record<string, string> = {
  py: 'text/x-python',
  js: 'text/javascript',
  mjs: 'text/javascript',
  cjs: 'text/javascript',
  jsx: 'text/jsx',
  ts: 'text/typescript',
  tsx: 'text/tsx',
  json: 'application/json',
  css: 'text/css',
  scss: 'text/x-scss',
  html: 'text/html',
  xml: 'application/xml',
  md: 'text/markdown',
  markdown: 'text/markdown',
  mmd: 'text/plain',
  mermaid: 'text/plain',
  sh: 'application/x-sh',
  bash: 'application/x-sh',
  zsh: 'application/x-sh',
  sql: 'application/sql',
  go: 'text/x-go',
  rs: 'text/rust',
  yml: 'application/x-yaml',
  yaml: 'application/x-yaml',
  java: 'text/x-java',
  c: 'text/x-c',
  h: 'text/x-c',
  cpp: 'text/x-c++',
  hpp: 'text/x-c++',
  cs: 'text/x-csharp',
  rb: 'application/x-ruby',
  php: 'application/x-httpd-php',
  swift: 'text/x-swift',
  kt: 'text/x-kotlin',
  txt: 'text/plain',
};

export function mimeFor(extOrTitle: string | null | undefined): string {
  if (!extOrTitle) return 'text/plain';
  // Accept either a bare ext ("py") or a filename ("main.py"). Normalising
  // means callers don't have to remember which they have.
  const ext =
    extOrTitle.includes('.') ? getExtension(extOrTitle) : extOrTitle.toLowerCase();
  if (!ext) return 'text/plain';
  return MIME_BY_EXT[ext] ?? 'text/plain';
}

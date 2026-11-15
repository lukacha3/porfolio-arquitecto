import type { SanityPortableTextBlock } from './queries';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders basic Sanity Portable Text (paragraphs, strong, em, links)
 * or plain multiline text into an array of safe HTML paragraph strings.
 * Runs exclusively at build time on the server (0 KB client JS).
 */
export function renderAboutParagraphs(
  value?: SanityPortableTextBlock[] | string | null,
  fallback?: string | null
): string[] {
  if (Array.isArray(value) && value.length > 0) {
    const paragraphs: string[] = [];

    for (const block of value) {
      if (!block || block._type !== 'block' || !Array.isArray(block.children)) {
        continue;
      }

      const markDefs = Array.isArray(block.markDefs) ? block.markDefs : [];
      const spanHtml = block.children
        .map((span) => {
          if (!span || typeof span.text !== 'string') return '';
          let html = escapeHtml(span.text).replace(/\n/g, '<br />');
          const marks = Array.isArray(span.marks) ? span.marks : [];

          for (const mark of marks) {
            if (mark === 'strong') {
              html = `<strong>${html}</strong>`;
            } else if (mark === 'em') {
              html = `<em>${html}</em>`;
            } else {
              const def = markDefs.find((d) => d._key === mark);
              if (def && def._type === 'link' && typeof def.href === 'string' && def.href.trim()) {
                const safeHref = escapeHtml(def.href.trim());
                const isExternal = /^https?:\/\//i.test(def.href.trim());
                const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
                html = `<a href="${safeHref}"${attrs}>${html}</a>`;
              }
            }
          }

          return html;
        })
        .join('');

      if (spanHtml.trim()) {
        paragraphs.push(spanHtml);
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs;
    }
  }

  const rawText = typeof value === 'string' && value.trim() ? value : fallback || '';
  return rawText
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => escapeHtml(p));
}

/**
 * Extracts plain text from Portable Text blocks or string (useful for SEO description / JSON-LD).
 */
export function portableTextToPlainText(
  value?: SanityPortableTextBlock[] | string | null,
  fallback = ''
): string {
  if (Array.isArray(value) && value.length > 0) {
    const text = value
      .filter((b) => b && b._type === 'block' && Array.isArray(b.children))
      .map((b) => (b.children || []).map((s) => s.text || '').join(''))
      .filter(Boolean)
      .join(' ');
    if (text.trim()) return text.trim();
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

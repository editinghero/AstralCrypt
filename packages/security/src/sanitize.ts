import DOMPurify from 'dompurify';

/**
 * HTML Sanitizer
 * 
 * Sanitizes HTML content to prevent XSS attacks by removing scripts and event handlers.
 * Validates: Requirements 6.1, 6.2, 6.3
 */

/**
 * Sanitizes HTML content using DOMPurify
 * 
 * Removes all script tags, event handlers, and other potentially malicious content
 * while preserving safe HTML structure and formatting.
 * 
 * @param html - The HTML content to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Document structure
      'html', 'head', 'body', 'title', 'meta', 'link', 'style',
      // Content tags
      'a', 'abbr', 'address', 'article', 'aside', 'b', 'bdi', 'bdo', 'blockquote',
      'br', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'dd', 'del', 'details',
      'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3',
      'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main',
      'mark', 'nav', 'ol', 'p', 'pre', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section',
      'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot',
      'th', 'thead', 'time', 'tr', 'u', 'ul', 'var', 'wbr', 'input'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', 'title', 'alt', 'src', 'href', 'target', 'rel',
      'colspan', 'rowspan', 'width', 'height', 'data-*', 'dir', 'lang', 'charset',
      'content', 'name', 'http-equiv', 'type', 'checked', 'disabled', 'value'
    ],
    ALLOW_DATA_ATTR: true,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
    WHOLE_DOCUMENT: true,
    FORCE_BODY: false,
  });
}

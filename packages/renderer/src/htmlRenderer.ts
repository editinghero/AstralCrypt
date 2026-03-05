/**
 * HTML Renderer
 * 
 * Renders decrypted HTML content in a secure sandboxed iframe environment.
 * Validates: Requirements 6.4, 6.5
 */

/**
 * Creates a sandboxed iframe element with restricted permissions
 * 
 * @returns A configured iframe element with sandbox restrictions
 */
export function createSandboxedIframe(): HTMLIFrameElement {
  const iframe = document.createElement('iframe');

  // Set sandbox attributes to restrict capabilities
  // allow-same-origin is REQUIRED for blob URLs to work across iframe boundary
  iframe.setAttribute('sandbox', 'allow-same-origin');

  // Styling
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.backgroundColor = '#fff';

  return iframe;
}

/**
 * Renders HTML content in a sandboxed iframe
 * 
 * Creates a new iframe with sandbox restrictions and renders the provided HTML.
 * Uses document.write() to ensure blob URLs work properly in the iframe context.
 * 
 * @param html - The HTML content to render
 * @param containerId - The ID of the container element to render into
 */
export function renderInSandbox(html: string, containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }

  // Clear existing content
  container.innerHTML = '';

  // Create and configure iframe
  const iframe = createSandboxedIframe();

  // Append to container first
  container.appendChild(iframe);

  // Wait for iframe to be ready, then write content
  // This ensures blob URLs created in parent context work in iframe
  if (iframe.contentDocument) {
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
  }
}

/**
 * Renders HTML content in a sandboxed iframe with custom styling
 * 
 * @param html - The HTML content to render
 * @param containerId - The ID of the container element
 * @param styles - Optional CSS styles to apply to the iframe
 */
export function renderInSandboxWithStyles(
  html: string,
  containerId: string,
  styles?: Partial<CSSStyleDeclaration>
): void {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }

  // Clear existing content
  container.innerHTML = '';

  // Create and configure iframe
  const iframe = createSandboxedIframe();

  // Apply custom styles
  if (styles) {
    Object.assign(iframe.style, styles);
  }

  // Append to container first
  container.appendChild(iframe);

  // Wait for iframe to be ready, then write content
  if (iframe.contentDocument) {
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
  }
}

// Wrap in IIFE to prevent redeclaration errors when re-injected
(function() {
  // Content selectors in priority order
  const CONTENT_SELECTORS = ['article', 'main', '[role="main"]'];

  // Find the main content element
  function findMainContent() {
    for (const selector of CONTENT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) return element;
    }
    return document.body;
  }

  // Selectors for elements that should be removed from content
  const SELECTORS_TO_REMOVE = [
    'nav',
    'header',
    'footer',
    'aside',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    '[role="complementary"]',
    '.nav',
    '.navigation',
    '.menu',
    '.sidebar',
    '.advertisement',
    '.ad',
    '.ads',
    '.social-share',
    '.comments',
    '.related-posts',
    'script',
    'style',
    'noscript',
    'iframe'
  ];

  // Remove non-content elements from a cloned node
  function removeNonContent(element) {
    SELECTORS_TO_REMOVE.forEach(selector => {
      element.querySelectorAll(selector).forEach(el => el.remove());
    });

    return element;
  }

  // Collapse multiple newlines into double newlines
  function collapseNewlines(text) {
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }

  // Extract and copy content
  function copyContent() {
    const mainContent = findMainContent();
    const clone = mainContent.cloneNode(true);
    removeNonContent(clone);

    // Use innerText if available (browser), fallback to textContent (jsdom)
    const rawText = clone.innerText || clone.textContent || '';
    const text = collapseNewlines(rawText);

    navigator.clipboard.writeText(text);
    return true;
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      findMainContent,
      removeNonContent,
      collapseNewlines,
      copyContent,
      CONTENT_SELECTORS,
      SELECTORS_TO_REMOVE
    };
  }

  // Auto-execute when loaded as content script in browser
  // Return the result so executeScript can capture it
  if (typeof module === 'undefined') {
    return copyContent();
  }
})();

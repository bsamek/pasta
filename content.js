(function() {
  // Find the main content element
  function findMainContent() {
    // Priority 1: article element
    const article = document.querySelector('article');
    if (article) return article;

    // Priority 2: main element
    const main = document.querySelector('main');
    if (main) return main;

    // Priority 3: role="main"
    const roleMain = document.querySelector('[role="main"]');
    if (roleMain) return roleMain;

    // Fallback: body
    return document.body;
  }

  // Remove non-content elements from a cloned node
  function removeNonContent(element) {
    const selectorsToRemove = [
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

    selectorsToRemove.forEach(selector => {
      element.querySelectorAll(selector).forEach(el => el.remove());
    });

    return element;
  }

  // Extract and copy content
  function copyContent() {
    const mainContent = findMainContent();
    const clone = mainContent.cloneNode(true);
    removeNonContent(clone);

    const text = clone.innerText
      .replace(/\n{3,}/g, '\n\n')  // Collapse multiple newlines
      .trim();

    navigator.clipboard.writeText(text);
    return true;
  }

  return copyContent();
})();

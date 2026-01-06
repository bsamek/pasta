const {
  findMainContent,
  removeNonContent,
  collapseNewlines,
  copyContent,
  SELECTORS_TO_REMOVE
} = require('../content.js');

describe('findMainContent', () => {
  describe('priority selection', () => {
    test('returns article element when present (Priority 1)', () => {
      document.body.innerHTML = `
        <main>Main content</main>
        <article>Article content</article>
      `;
      const result = findMainContent();
      expect(result.tagName).toBe('ARTICLE');
    });

    test('returns main element when no article present (Priority 2)', () => {
      document.body.innerHTML = `
        <div role="main">Role main content</div>
        <main>Main content</main>
      `;
      const result = findMainContent();
      expect(result.tagName).toBe('MAIN');
    });

    test('returns element with role="main" when no article or main (Priority 3)', () => {
      document.body.innerHTML = `
        <div role="main">Role main content</div>
        <div>Other content</div>
      `;
      const result = findMainContent();
      expect(result.getAttribute('role')).toBe('main');
    });

    test('falls back to body when no content elements found', () => {
      document.body.innerHTML = `
        <div>Some content</div>
        <span>More content</span>
      `;
      const result = findMainContent();
      expect(result.tagName).toBe('BODY');
    });
  });

  describe('edge cases', () => {
    test('returns first article when multiple articles exist', () => {
      document.body.innerHTML = `
        <article id="first">First article</article>
        <article id="second">Second article</article>
      `;
      const result = findMainContent();
      expect(result.id).toBe('first');
    });

    test('handles nested article elements', () => {
      document.body.innerHTML = `
        <main>
          <article id="nested">Nested article</article>
        </main>
      `;
      const result = findMainContent();
      expect(result.id).toBe('nested');
    });

    test('handles article inside main', () => {
      document.body.innerHTML = `
        <main>
          <article>Article inside main</article>
        </main>
      `;
      const result = findMainContent();
      expect(result.tagName).toBe('ARTICLE');
    });

    test('handles empty body', () => {
      document.body.innerHTML = '';
      const result = findMainContent();
      expect(result.tagName).toBe('BODY');
    });

    test('handles deeply nested main content', () => {
      document.body.innerHTML = `
        <div>
          <div>
            <div>
              <article>Deep article</article>
            </div>
          </div>
        </div>
      `;
      const result = findMainContent();
      expect(result.tagName).toBe('ARTICLE');
    });
  });
});

describe('removeNonContent', () => {
  describe('semantic element removal', () => {
    test('removes nav elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <nav>Navigation</nav>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('nav')).toBeNull();
      expect(container.querySelector('p')).not.toBeNull();
    });

    test('removes header elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <header>Header</header>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('header')).toBeNull();
      expect(container.querySelector('p')).not.toBeNull();
    });

    test('removes footer elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <p>Content</p>
        <footer>Footer</footer>
      `;
      removeNonContent(container);
      expect(container.querySelector('footer')).toBeNull();
      expect(container.querySelector('p')).not.toBeNull();
    });

    test('removes aside elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <aside>Sidebar</aside>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('aside')).toBeNull();
      expect(container.querySelector('p')).not.toBeNull();
    });
  });

  describe('ARIA role removal', () => {
    test('removes elements with role="navigation"', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="navigation">Nav</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('[role="navigation"]')).toBeNull();
    });

    test('removes elements with role="banner"', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="banner">Banner</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('[role="banner"]')).toBeNull();
    });

    test('removes elements with role="contentinfo"', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="contentinfo">Footer info</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('[role="contentinfo"]')).toBeNull();
    });

    test('removes elements with role="complementary"', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div role="complementary">Sidebar</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('[role="complementary"]')).toBeNull();
    });
  });

  describe('class-based removal', () => {
    test('removes .nav elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="nav">Navigation</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.nav')).toBeNull();
    });

    test('removes .navigation elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="navigation">Navigation</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.navigation')).toBeNull();
    });

    test('removes .menu elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="menu">Menu</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.menu')).toBeNull();
    });

    test('removes .sidebar elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="sidebar">Sidebar</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.sidebar')).toBeNull();
    });

    test('removes advertisement elements (.advertisement, .ad, .ads)', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="advertisement">Ad 1</div>
        <div class="ad">Ad 2</div>
        <div class="ads">Ad 3</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.advertisement')).toBeNull();
      expect(container.querySelector('.ad')).toBeNull();
      expect(container.querySelector('.ads')).toBeNull();
    });

    test('removes .social-share elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="social-share">Share buttons</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.social-share')).toBeNull();
    });

    test('removes .comments elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="comments">Comments section</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.comments')).toBeNull();
    });

    test('removes .related-posts elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="related-posts">Related posts</div>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('.related-posts')).toBeNull();
    });
  });

  describe('script and style removal', () => {
    test('removes script elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <script>console.log('test');</script>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('script')).toBeNull();
    });

    test('removes style elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <style>.test { color: red; }</style>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('style')).toBeNull();
    });

    test('removes noscript elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <noscript>Enable JavaScript</noscript>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('noscript')).toBeNull();
    });

    test('removes iframe elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <iframe src="https://example.com"></iframe>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('iframe')).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('handles nested elements to remove', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <nav>
          <header>Nested header</header>
          <div class="menu">Nested menu</div>
        </nav>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelector('nav')).toBeNull();
      expect(container.querySelector('header')).toBeNull();
      expect(container.querySelector('.menu')).toBeNull();
    });

    test('preserves content not matching selectors', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <p>Paragraph</p>
        <div class="article-content">Article content</div>
        <span>Span text</span>
        <h1>Heading</h1>
      `;
      removeNonContent(container);
      expect(container.querySelector('p')).not.toBeNull();
      expect(container.querySelector('.article-content')).not.toBeNull();
      expect(container.querySelector('span')).not.toBeNull();
      expect(container.querySelector('h1')).not.toBeNull();
    });

    test('handles empty container', () => {
      const container = document.createElement('div');
      const result = removeNonContent(container);
      expect(result).toBe(container);
    });

    test('handles container with only removable elements', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <nav>Navigation</nav>
        <footer>Footer</footer>
      `;
      removeNonContent(container);
      expect(container.innerHTML.trim()).toBe('');
    });

    test('returns the same element reference', () => {
      const container = document.createElement('div');
      container.innerHTML = '<p>Content</p>';
      const result = removeNonContent(container);
      expect(result).toBe(container);
    });

    test('removes multiple elements of same type', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <nav id="nav1">Nav 1</nav>
        <nav id="nav2">Nav 2</nav>
        <nav id="nav3">Nav 3</nav>
        <p>Content</p>
      `;
      removeNonContent(container);
      expect(container.querySelectorAll('nav').length).toBe(0);
    });
  });
});

describe('collapseNewlines', () => {
  test('collapses three newlines to two', () => {
    const result = collapseNewlines('Line 1\n\n\nLine 2');
    expect(result).toBe('Line 1\n\nLine 2');
  });

  test('collapses many newlines to two', () => {
    const result = collapseNewlines('Line 1\n\n\n\n\n\n\nLine 2');
    expect(result).toBe('Line 1\n\nLine 2');
  });

  test('preserves double newlines', () => {
    const result = collapseNewlines('Line 1\n\nLine 2');
    expect(result).toBe('Line 1\n\nLine 2');
  });

  test('preserves single newlines', () => {
    const result = collapseNewlines('Line 1\nLine 2');
    expect(result).toBe('Line 1\nLine 2');
  });

  test('trims leading whitespace', () => {
    const result = collapseNewlines('  \n\n  Content');
    expect(result).toBe('Content');
  });

  test('trims trailing whitespace', () => {
    const result = collapseNewlines('Content  \n\n  ');
    expect(result).toBe('Content');
  });

  test('handles multiple collapse points', () => {
    const result = collapseNewlines('A\n\n\n\nB\n\n\n\nC');
    expect(result).toBe('A\n\nB\n\nC');
  });

  test('handles empty string', () => {
    const result = collapseNewlines('');
    expect(result).toBe('');
  });

  test('handles string with only whitespace', () => {
    const result = collapseNewlines('   \n\n\n   ');
    expect(result).toBe('');
  });
});

describe('copyContent', () => {
  beforeEach(() => {
    navigator.clipboard.writeText.mockClear();
  });

  test('copies content to clipboard', () => {
    document.body.innerHTML = `
      <article>
        <p>Test content</p>
      </article>
    `;
    copyContent();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('returns true on success', () => {
    document.body.innerHTML = '<article>Content</article>';
    const result = copyContent();
    expect(result).toBe(true);
  });

  test('does not modify the original DOM', () => {
    document.body.innerHTML = `
      <article>
        <nav>Navigation</nav>
        <p>Content</p>
      </article>
    `;
    copyContent();
    expect(document.querySelector('nav')).not.toBeNull();
  });

  test('removes non-content from copied text', () => {
    document.body.innerHTML = `
      <article>
        <nav>Navigation text</nav>
        <p>Main content</p>
        <footer>Footer text</footer>
      </article>
    `;
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).not.toContain('Navigation text');
    expect(copiedText).not.toContain('Footer text');
    expect(copiedText).toContain('Main content');
  });

  test('collapses multiple newlines in output', () => {
    document.body.innerHTML = `
      <article>
        <p>Line 1</p>
        <p></p>
        <p></p>
        <p></p>
        <p>Line 2</p>
      </article>
    `;
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).not.toMatch(/\n{3,}/);
  });
});

describe('SELECTORS_TO_REMOVE', () => {
  test('contains expected number of selectors', () => {
    expect(SELECTORS_TO_REMOVE.length).toBeGreaterThanOrEqual(18);
  });

  test('includes all semantic elements', () => {
    expect(SELECTORS_TO_REMOVE).toContain('nav');
    expect(SELECTORS_TO_REMOVE).toContain('header');
    expect(SELECTORS_TO_REMOVE).toContain('footer');
    expect(SELECTORS_TO_REMOVE).toContain('aside');
  });

  test('includes all ARIA roles', () => {
    expect(SELECTORS_TO_REMOVE).toContain('[role="navigation"]');
    expect(SELECTORS_TO_REMOVE).toContain('[role="banner"]');
    expect(SELECTORS_TO_REMOVE).toContain('[role="contentinfo"]');
    expect(SELECTORS_TO_REMOVE).toContain('[role="complementary"]');
  });

  test('includes script/style elements', () => {
    expect(SELECTORS_TO_REMOVE).toContain('script');
    expect(SELECTORS_TO_REMOVE).toContain('style');
    expect(SELECTORS_TO_REMOVE).toContain('noscript');
    expect(SELECTORS_TO_REMOVE).toContain('iframe');
  });
});

describe('re-injection guard', () => {
  const contentPath = require.resolve('../content.js');

  beforeEach(() => {
    // Reset the window flags
    delete window.__pastaContentLoaded;
    delete window.__pastaCopyContent;
  });

  afterEach(() => {
    // Clean up
    delete window.__pastaContentLoaded;
    delete window.__pastaCopyContent;
  });

  test('sets __pastaContentLoaded flag on first load', () => {
    jest.isolateModules(() => {
      expect(window.__pastaContentLoaded).toBeUndefined();
      require('../content.js');
      expect(window.__pastaContentLoaded).toBe(true);
    });
  });

  test('stores copyContent reference on window', () => {
    jest.isolateModules(() => {
      expect(window.__pastaCopyContent).toBeUndefined();
      require('../content.js');
      expect(typeof window.__pastaCopyContent).toBe('function');
    });
  });

  test('calls stored copyContent on re-injection', () => {
    // Set up as if script was already loaded
    window.__pastaContentLoaded = true;
    const mockCopyContent = jest.fn();
    window.__pastaCopyContent = mockCopyContent;

    // Load module - should detect already loaded and call stored function
    jest.isolateModules(() => {
      require('../content.js');
    });

    // Should have called the stored function (re-injection path)
    expect(mockCopyContent).toHaveBeenCalled();
  });
});

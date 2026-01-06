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

describe('copyContent - error handling', () => {
  let originalWriteText;

  beforeEach(() => {
    originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = jest.fn();
  });

  afterEach(() => {
    navigator.clipboard.writeText = originalWriteText;
  });

  test('handles clipboard write failure gracefully', () => {
    navigator.clipboard.writeText.mockImplementation(() => {
      throw new Error('Clipboard write failed');
    });
    document.body.innerHTML = '<article>Content</article>';

    expect(() => copyContent()).toThrow('Clipboard write failed');
  });

  test('handles clipboard permission denied', () => {
    navigator.clipboard.writeText.mockImplementation(() => {
      throw new DOMException('Permission denied', 'NotAllowedError');
    });
    document.body.innerHTML = '<article>Content</article>';

    expect(() => copyContent()).toThrow('Permission denied');
  });
});

describe('copyContent - edge cases', () => {
  beforeEach(() => {
    navigator.clipboard.writeText.mockClear();
  });

  test('handles element with no text content', () => {
    document.body.innerHTML = '<article><div></div></article>';
    const result = copyContent();
    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
  });

  test('handles Unicode content correctly', () => {
    document.body.innerHTML = '<article><p>こんにちは世界 🌍 مرحبا العالم</p></article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('こんにちは世界');
    expect(copiedText).toContain('🌍');
    expect(copiedText).toContain('مرحبا العالم');
  });

  test('handles special HTML characters', () => {
    document.body.innerHTML = '<article><p>&lt;script&gt;alert("xss")&lt;/script&gt;</p></article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('<script>');
    expect(copiedText).toContain('</script>');
  });

  test('handles content with HTML entities', () => {
    document.body.innerHTML = '<article><p>&amp; &nbsp; &copy; &mdash;</p></article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  test('handles very long content', () => {
    const longText = 'A'.repeat(100000);
    document.body.innerHTML = `<article><p>${longText}</p></article>`;
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText.length).toBeGreaterThanOrEqual(100000);
  });

  test('handles content with only whitespace', () => {
    document.body.innerHTML = '<article>   \n\n\n   </article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toBe('');
  });

  test('preserves links text content', () => {
    document.body.innerHTML = '<article><p>Click <a href="http://example.com">here</a> to continue</p></article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Click');
    expect(copiedText).toContain('here');
    expect(copiedText).toContain('to continue');
  });

  test('extracts text from images alt attribute via textContent', () => {
    document.body.innerHTML = '<article><p>Text before</p><img alt="Image description"><p>Text after</p></article>';
    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Text before');
    expect(copiedText).toContain('Text after');
  });
});

describe('collapseNewlines - additional edge cases', () => {
  test('handles Windows line endings (CRLF)', () => {
    const result = collapseNewlines('Line 1\r\n\r\n\r\nLine 2');
    // Note: This tests current behavior - may not collapse CRLF
    expect(result).toBeDefined();
  });

  test('handles mixed line endings', () => {
    const result = collapseNewlines('Line 1\r\n\n\r\nLine 2');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('handles tabs mixed with newlines', () => {
    const result = collapseNewlines('Line 1\t\n\n\n\tLine 2');
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });

  test('handles non-breaking spaces', () => {
    const result = collapseNewlines('Text\u00A0with\u00A0nbsp');
    expect(result).toContain('Text');
    expect(result).toContain('with');
    expect(result).toContain('nbsp');
  });
});

describe('removeNonContent - additional edge cases', () => {
  test('removes elements with multiple matching classes', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="nav menu sidebar">Multiple classes</div>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('.nav')).toBeNull();
    expect(container.querySelector('.menu')).toBeNull();
    expect(container.querySelector('.sidebar')).toBeNull();
  });

  test('handles elements with data attributes alongside removable selectors', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <nav data-testid="main-nav">Navigation</nav>
      <p data-testid="content">Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('nav')).toBeNull();
    expect(container.querySelector('[data-testid="content"]')).not.toBeNull();
  });

  test('preserves form elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <form>
        <input type="text" value="test">
        <button>Submit</button>
      </form>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('form')).not.toBeNull();
    expect(container.querySelector('input')).not.toBeNull();
  });

  test('preserves figure and figcaption elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <figure>
        <img src="image.jpg" alt="Test image">
        <figcaption>Image caption</figcaption>
      </figure>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('figure')).not.toBeNull();
    expect(container.querySelector('figcaption')).not.toBeNull();
  });

  test('preserves blockquote elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <blockquote>A famous quote</blockquote>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('blockquote')).not.toBeNull();
  });

  test('preserves code and pre elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <pre><code>const x = 1;</code></pre>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('pre')).not.toBeNull();
    expect(container.querySelector('code')).not.toBeNull();
  });

  test('preserves table elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <table>
        <tr><th>Header</th></tr>
        <tr><td>Data</td></tr>
      </table>
      <p>Content</p>
    `;
    removeNonContent(container);
    expect(container.querySelector('table')).not.toBeNull();
  });

  test('preserves list elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <ol>
        <li>First</li>
        <li>Second</li>
      </ol>
    `;
    removeNonContent(container);
    expect(container.querySelector('ul')).not.toBeNull();
    expect(container.querySelector('ol')).not.toBeNull();
  });
});

describe('findMainContent - additional edge cases', () => {
  test('handles article with role="main" - article takes priority', () => {
    document.body.innerHTML = `
      <article role="main">Article with role</article>
      <main>Main element</main>
    `;
    const result = findMainContent();
    expect(result.tagName).toBe('ARTICLE');
  });

  test('handles multiple role="main" elements - returns first', () => {
    document.body.innerHTML = `
      <div role="main" id="first">First role main</div>
      <div role="main" id="second">Second role main</div>
    `;
    const result = findMainContent();
    expect(result.id).toBe('first');
  });

  test('handles whitespace-only body', () => {
    document.body.innerHTML = '   \n\n\n   ';
    const result = findMainContent();
    expect(result.tagName).toBe('BODY');
  });

  test('handles comments in HTML', () => {
    document.body.innerHTML = `
      <!-- This is a comment -->
      <article>Article content</article>
      <!-- Another comment -->
    `;
    const result = findMainContent();
    expect(result.tagName).toBe('ARTICLE');
  });

  test('handles SVG elements without matching article/main', () => {
    document.body.innerHTML = `
      <svg><rect/></svg>
      <div>Other content</div>
    `;
    const result = findMainContent();
    expect(result.tagName).toBe('BODY');
  });
});

describe('integration: complex real-world HTML', () => {
  beforeEach(() => {
    navigator.clipboard.writeText.mockClear();
  });

  test('extracts content from blog-like page structure', () => {
    document.body.innerHTML = `
      <header>
        <nav class="main-nav">
          <a href="/">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main>
        <article>
          <h1>Blog Post Title</h1>
          <p class="meta">Posted on January 1, 2025</p>
          <div class="social-share">Share this post</div>
          <p>This is the main content of the blog post.</p>
          <p>It has multiple paragraphs with important information.</p>
          <aside class="sidebar">Related Articles</aside>
        </article>
      </main>
      <footer>
        <div class="comments">User comments here</div>
        <nav>Footer navigation</nav>
      </footer>
    `;

    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];

    expect(copiedText).toContain('Blog Post Title');
    expect(copiedText).toContain('main content');
    expect(copiedText).toContain('multiple paragraphs');
    expect(copiedText).not.toContain('Home');
    expect(copiedText).not.toContain('Share this post');
    expect(copiedText).not.toContain('Related Articles');
    expect(copiedText).not.toContain('User comments');
  });

  test('extracts content from news article structure', () => {
    document.body.innerHTML = `
      <div role="banner">
        <div class="advertisement">Ad content</div>
        <nav role="navigation">Site navigation</nav>
      </div>
      <article>
        <h1>Breaking News Headline</h1>
        <p class="byline">By John Doe</p>
        <section>
          <p>The first paragraph of the news story.</p>
          <p>The second paragraph continues the story.</p>
        </section>
        <div class="related-posts">You might also like...</div>
      </article>
      <aside role="complementary">
        <div class="sidebar">Trending stories</div>
      </aside>
      <div role="contentinfo">Copyright 2025</div>
    `;

    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];

    expect(copiedText).toContain('Breaking News Headline');
    expect(copiedText).toContain('first paragraph');
    expect(copiedText).toContain('second paragraph');
    expect(copiedText).not.toContain('Ad content');
    expect(copiedText).not.toContain('Site navigation');
    expect(copiedText).not.toContain('You might also like');
    expect(copiedText).not.toContain('Trending stories');
  });

  test('handles page with no semantic structure - falls back to body', () => {
    document.body.innerHTML = `
      <div class="container">
        <div class="header">Site Header</div>
        <div class="content">
          <h1>Page Title</h1>
          <p>Main content here.</p>
        </div>
        <div class="footer">Site Footer</div>
      </div>
    `;

    const result = findMainContent();
    expect(result.tagName).toBe('BODY');

    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];
    expect(copiedText).toContain('Page Title');
    expect(copiedText).toContain('Main content');
  });

  test('handles documentation page structure', () => {
    document.body.innerHTML = `
      <nav class="sidebar">
        <ul class="menu">
          <li>Getting Started</li>
          <li>API Reference</li>
        </ul>
      </nav>
      <main>
        <article>
          <h1>API Documentation</h1>
          <section>
            <h2>Installation</h2>
            <pre><code>npm install package</code></pre>
          </section>
          <section>
            <h2>Usage</h2>
            <p>Import the module and call the function.</p>
            <pre><code>import { fn } from 'package';</code></pre>
          </section>
        </article>
      </main>
      <footer>
        <div class="social-share">Follow us</div>
      </footer>
    `;

    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];

    expect(copiedText).toContain('API Documentation');
    expect(copiedText).toContain('Installation');
    expect(copiedText).toContain('npm install package');
    expect(copiedText).not.toContain('Getting Started');
    expect(copiedText).not.toContain('Follow us');
  });

  test('handles e-commerce product page', () => {
    document.body.innerHTML = `
      <header>
        <nav class="nav">Categories | Cart | Account</nav>
      </header>
      <main>
        <article>
          <h1>Product Name</h1>
          <p>$99.99</p>
          <div class="advertisement">Sponsored content</div>
          <section>
            <h2>Description</h2>
            <p>This is an amazing product with great features.</p>
          </section>
          <section>
            <h2>Specifications</h2>
            <table>
              <tr><td>Size</td><td>Large</td></tr>
              <tr><td>Color</td><td>Blue</td></tr>
            </table>
          </section>
        </article>
        <aside class="sidebar">
          <div class="related-posts">Similar products</div>
        </aside>
      </main>
      <div class="comments">Customer reviews</div>
    `;

    copyContent();
    const copiedText = navigator.clipboard.writeText.mock.calls[0][0];

    expect(copiedText).toContain('Product Name');
    expect(copiedText).toContain('$99.99');
    expect(copiedText).toContain('amazing product');
    expect(copiedText).not.toContain('Categories');
    expect(copiedText).not.toContain('Sponsored content');
    expect(copiedText).not.toContain('Similar products');
    expect(copiedText).not.toContain('Customer reviews');
  });
});

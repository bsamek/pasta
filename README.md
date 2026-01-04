# Pasta

A Chrome extension that copies the main content of a webpage to your clipboard, filtering out navigation, menus, and other non-article elements. Perfect for pasting articles into AI assistants.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this folder

## Usage

Click the extension icon on any webpage. The main content will be copied to your clipboard, and a ✓ badge will appear to confirm.

The extension intelligently extracts content by looking for `<article>`, `<main>`, or `[role="main"]` elements, and removes navigation, headers, footers, sidebars, and ads.

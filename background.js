chrome.action.onClicked.addListener(async (tab) => {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    if (results && results[0] && results[0].result) {
      // Show success badge
      chrome.action.setBadgeText({ text: '✓', tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tab.id });

      // Clear badge after 2 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to copy page content:', error);
    // Show error badge
    chrome.action.setBadgeText({ text: '✗', tabId: tab.id });
    chrome.action.setBadgeBackgroundColor({ color: '#f44336', tabId: tab.id });

    setTimeout(() => {
      chrome.action.setBadgeText({ text: '', tabId: tab.id });
    }, 2000);
  }
});

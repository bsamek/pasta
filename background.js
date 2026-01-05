const BADGE_SUCCESS = { text: '✓', color: '#4CAF50' };
const BADGE_ERROR = { text: '✗', color: '#f44336' };
const BADGE_CLEAR_DELAY = 2000;

const DEFAULT_ICON = {
  16: 'icons/icon16.png',
  48: 'icons/icon48.png',
  128: 'icons/icon128.png'
};

const SUCCESS_ICON = {
  16: 'icons/success16.png',
  48: 'icons/success48.png',
  128: 'icons/success128.png'
};

const ERROR_ICON = {
  16: 'icons/error16.png',
  48: 'icons/error48.png',
  128: 'icons/error128.png'
};

async function handleActionClick(tab) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    if (results && results[0] && results[0].result) {
      showBadge(tab.id, BADGE_SUCCESS, SUCCESS_ICON);
    }
  } catch (error) {
    console.error('Failed to copy page content:', error);
    showBadge(tab.id, BADGE_ERROR, ERROR_ICON);
  }
}

function showBadge(tabId, { text, color }, icon) {
  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
  chrome.action.setIcon({ path: icon, tabId });

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '', tabId });
    chrome.action.setIcon({ path: DEFAULT_ICON, tabId });
  }, BADGE_CLEAR_DELAY);
}

// Register listener when loaded as extension
if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(handleActionClick);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleActionClick,
    showBadge,
    BADGE_SUCCESS,
    BADGE_ERROR,
    BADGE_CLEAR_DELAY,
    DEFAULT_ICON,
    SUCCESS_ICON,
    ERROR_ICON
  };
}

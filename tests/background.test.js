const {
  handleActionClick,
  showBadge,
  BADGE_SUCCESS,
  BADGE_ERROR,
  BADGE_CLEAR_DELAY,
  DEFAULT_ICON
} = require('../background.js');

describe('constants', () => {
  test('BADGE_SUCCESS has correct text', () => {
    expect(BADGE_SUCCESS.text).toBe('✓');
  });

  test('BADGE_SUCCESS has correct color', () => {
    expect(BADGE_SUCCESS.color).toBe('#4CAF50');
  });

  test('BADGE_ERROR has correct text', () => {
    expect(BADGE_ERROR.text).toBe('✗');
  });

  test('BADGE_ERROR has correct color', () => {
    expect(BADGE_ERROR.color).toBe('#f44336');
  });

  test('BADGE_CLEAR_DELAY is 2000ms', () => {
    expect(BADGE_CLEAR_DELAY).toBe(2000);
  });

  test('DEFAULT_ICON has correct paths', () => {
    expect(DEFAULT_ICON).toEqual({
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png'
    });
  });
});

describe('showBadge', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('sets badge text', () => {
    showBadge(123, BADGE_SUCCESS);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 123
    });
  });

  test('sets badge background color', () => {
    showBadge(123, BADGE_SUCCESS);
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#4CAF50',
      tabId: 123
    });
  });

  test('clears badge after delay', () => {
    showBadge(123, BADGE_SUCCESS);

    expect(chrome.action.setBadgeText).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(BADGE_CLEAR_DELAY);

    expect(chrome.action.setBadgeText).toHaveBeenCalledTimes(2);
    expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({
      text: '',
      tabId: 123
    });
  });

  test('shows error badge correctly', () => {
    showBadge(456, BADGE_ERROR);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 456
    });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#f44336',
      tabId: 456
    });
  });

  test('uses correct tabId', () => {
    const tabId = 999;
    showBadge(tabId, BADGE_SUCCESS);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith(
      expect.objectContaining({ tabId })
    );
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith(
      expect.objectContaining({ tabId })
    );
  });

  test('sets icon with default icon path', () => {
    showBadge(123, BADGE_SUCCESS);
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: DEFAULT_ICON,
      tabId: 123
    });
  });

  test('sets icon before setting badge text', () => {
    showBadge(123, BADGE_SUCCESS);
    const setIconOrder = chrome.action.setIcon.mock.invocationCallOrder[0];
    const setBadgeTextOrder = chrome.action.setBadgeText.mock.invocationCallOrder[0];
    expect(setIconOrder).toBeLessThan(setBadgeTextOrder);
  });
});

describe('handleActionClick', () => {
  const mockTab = { id: 123 };

  beforeEach(() => {
    jest.useFakeTimers();
    chrome.scripting.executeScript.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('executes content script on tab', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);

    await handleActionClick(mockTab);

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 123 },
      files: ['content.js']
    });
  });

  test('shows success badge when script succeeds', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);

    await handleActionClick(mockTab);

    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: DEFAULT_ICON,
      tabId: 123
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 123
    });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#4CAF50',
      tabId: 123
    });
  });

  test('shows error badge when script throws', async () => {
    chrome.scripting.executeScript.mockRejectedValue(new Error('Script failed'));

    await handleActionClick(mockTab);

    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: DEFAULT_ICON,
      tabId: 123
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#f44336',
      tabId: 123
    });
  });

  test('does not show success badge when result is falsy', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: false }]);

    await handleActionClick(mockTab);

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });

  test('does not show success badge when results array is empty', async () => {
    chrome.scripting.executeScript.mockResolvedValue([]);

    await handleActionClick(mockTab);

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });

  test('does not show success badge when results is null', async () => {
    chrome.scripting.executeScript.mockResolvedValue(null);

    await handleActionClick(mockTab);

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });

  test('handles undefined result gracefully', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: undefined }]);

    await handleActionClick(mockTab);

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });
});

describe('integration scenarios', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('full success flow: click -> execute -> badge -> clear', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);
    const tab = { id: 100 };

    await handleActionClick(tab);

    // Icon should be set first
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: DEFAULT_ICON,
      tabId: 100
    });

    // Badge should be shown
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 100
    });

    // Fast forward past the delay
    jest.advanceTimersByTime(BADGE_CLEAR_DELAY);

    // Badge should be cleared
    expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({
      text: '',
      tabId: 100
    });
  });

  test('full error flow: click -> error -> badge -> clear', async () => {
    chrome.scripting.executeScript.mockRejectedValue(new Error('Permission denied'));
    const tab = { id: 200 };

    await handleActionClick(tab);

    // Icon should be set first
    expect(chrome.action.setIcon).toHaveBeenCalledWith({
      path: DEFAULT_ICON,
      tabId: 200
    });

    // Error badge should be shown
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 200
    });

    // Fast forward past the delay
    jest.advanceTimersByTime(BADGE_CLEAR_DELAY);

    // Badge should be cleared
    expect(chrome.action.setBadgeText).toHaveBeenLastCalledWith({
      text: '',
      tabId: 200
    });
  });

  test('multiple rapid clicks on different tabs', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);

    await handleActionClick({ id: 1 });
    await handleActionClick({ id: 2 });
    await handleActionClick({ id: 3 });

    expect(chrome.scripting.executeScript).toHaveBeenCalledTimes(3);
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '✓', tabId: 1 });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '✓', tabId: 2 });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '✓', tabId: 3 });
  });
});

describe('handleActionClick - additional edge cases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    chrome.scripting.executeScript.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('works correctly when result includes frameId property', async () => {
    // Chrome returns frameId with results; verify it doesn't break our logic
    chrome.scripting.executeScript.mockResolvedValue([{
      result: true,
      frameId: 0
    }]);

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 123
    });
  });

  test('uses first frame result when multiple frames present', async () => {
    // Documents current behavior: only first frame's result is checked
    // This is intentional - content script runs in main frame only
    chrome.scripting.executeScript.mockResolvedValue([
      { result: true, frameId: 0 },
      { result: false, frameId: 1 }
    ]);

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 123
    });
  });

  test('handles network error during script execution', async () => {
    chrome.scripting.executeScript.mockRejectedValue(new Error('net::ERR_INTERNET_DISCONNECTED'));

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
  });

  test('handles chrome runtime errors', async () => {
    chrome.scripting.executeScript.mockRejectedValue(new Error('Cannot access a chrome:// URL'));

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
  });

  test('handles extension context invalidated error', async () => {
    chrome.scripting.executeScript.mockRejectedValue(
      new Error('Extension context invalidated')
    );

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
  });

  test('handles tab closed during execution', async () => {
    chrome.scripting.executeScript.mockRejectedValue(
      new Error('No tab with id: 123')
    );

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
  });

  test('shows no badge when script returns null result with error', async () => {
    // Documents current behavior: falsy results show no badge
    // This is intentional - success badge only shown for truthy results
    // Error badge is only shown when executeScript itself throws
    chrome.scripting.executeScript.mockResolvedValue([{
      result: null,
      error: { message: 'Script error' }
    }]);

    await handleActionClick({ id: 123 });

    expect(chrome.action.setBadgeText).not.toHaveBeenCalled();
  });

  test('handles zero as tab id', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);

    await handleActionClick({ id: 0 });

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 0 },
      files: ['content.js']
    });
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 0
    });
  });

  test('handles very large tab id', async () => {
    chrome.scripting.executeScript.mockResolvedValue([{ result: true }]);
    const largeTabId = 2147483647; // Max 32-bit signed integer

    await handleActionClick({ id: largeTabId });

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: largeTabId },
      files: ['content.js']
    });
  });
});

describe('showBadge - additional edge cases', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('handles zero as tabId', () => {
    showBadge(0, BADGE_SUCCESS);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✓',
      tabId: 0
    });
  });

  test('multiple badges clear independently', () => {
    showBadge(1, BADGE_SUCCESS);

    jest.advanceTimersByTime(1000);

    showBadge(2, BADGE_SUCCESS);

    jest.advanceTimersByTime(1000);

    // First badge should be cleared
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 1
    });

    jest.advanceTimersByTime(1000);

    // Second badge should also be cleared
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 2
    });
  });

  test('badge clear timeout uses correct delay', () => {
    showBadge(123, BADGE_SUCCESS);

    // Badge should not be cleared before delay
    jest.advanceTimersByTime(BADGE_CLEAR_DELAY - 1);
    expect(chrome.action.setBadgeText).toHaveBeenCalledTimes(1);

    // Badge should be cleared exactly at delay
    jest.advanceTimersByTime(1);
    expect(chrome.action.setBadgeText).toHaveBeenCalledTimes(2);
  });

  test('handles custom badge config', () => {
    const customBadge = { text: '!', color: '#FF0000' };
    showBadge(123, customBadge);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '!',
      tabId: 123
    });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#FF0000',
      tabId: 123
    });
  });

  test('handles empty text badge', () => {
    const emptyBadge = { text: '', color: '#000000' };
    showBadge(123, emptyBadge);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '',
      tabId: 123
    });
  });
});

describe('constants validation', () => {
  test('BADGE_SUCCESS color is valid hex', () => {
    expect(BADGE_SUCCESS.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('BADGE_ERROR color is valid hex', () => {
    expect(BADGE_ERROR.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('BADGE_CLEAR_DELAY is positive number', () => {
    expect(BADGE_CLEAR_DELAY).toBeGreaterThan(0);
  });

  test('DEFAULT_ICON contains all required sizes', () => {
    expect(DEFAULT_ICON).toHaveProperty('16');
    expect(DEFAULT_ICON).toHaveProperty('48');
    expect(DEFAULT_ICON).toHaveProperty('128');
  });

  test('DEFAULT_ICON paths have correct extension', () => {
    expect(DEFAULT_ICON[16]).toMatch(/\.png$/);
    expect(DEFAULT_ICON[48]).toMatch(/\.png$/);
    expect(DEFAULT_ICON[128]).toMatch(/\.png$/);
  });
});

const {
  handleActionClick,
  showBadge,
  BADGE_SUCCESS,
  BADGE_ERROR,
  BADGE_CLEAR_DELAY
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
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    chrome.scripting.executeScript.mockRejectedValue(new Error('Script failed'));

    await handleActionClick(mockTab);

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({
      text: '✗',
      tabId: 123
    });
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({
      color: '#f44336',
      tabId: 123
    });

    consoleError.mockRestore();
  });

  test('logs error when script fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Script failed');
    chrome.scripting.executeScript.mockRejectedValue(error);

    await handleActionClick(mockTab);

    expect(consoleError).toHaveBeenCalledWith('Failed to copy page content:', error);

    consoleError.mockRestore();
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
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    chrome.scripting.executeScript.mockRejectedValue(new Error('Permission denied'));
    const tab = { id: 200 };

    await handleActionClick(tab);

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

    consoleError.mockRestore();
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

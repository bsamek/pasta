// Chrome API mocks
global.chrome = {
  action: {
    onClicked: {
      addListener: jest.fn()
    },
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  },
  scripting: {
    executeScript: jest.fn()
  }
};

// Navigator clipboard mock
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined)
  },
  writable: true
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

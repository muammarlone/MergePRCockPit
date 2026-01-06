import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.electronAPI
global.window.electronAPI = {
  getPRs: jest.fn(),
  getPRDetails: jest.fn(),
  updatePR: jest.fn(),
  getReviewStatus: jest.fn(),
  mergePR: jest.fn(),
  getAIInsights: jest.fn(),
  getRepositories: jest.fn(),
  getOllamaStatus: jest.fn(),
  clearOllamaCache: jest.fn(),
  startGitHubOAuth: jest.fn(),
  startGoogleOAuth: jest.fn(),
  startLinkedInOAuth: jest.fn(),
};

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(localStorage).forEach(key => {
    localStorage.removeItem(key);
  });
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('Act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock electronAPI utilities
export const setupElectronAPIMock = () => {
  window.electronAPI = {
    getPRs: jest.fn().mockResolvedValue([]),
    getPRDetails: jest.fn().mockResolvedValue({}),
    updatePR: jest.fn().mockResolvedValue({}),
    getReviewStatus: jest.fn().mockResolvedValue({}),
    mergePR: jest.fn().mockResolvedValue({}),
    getAIInsights: jest.fn().mockResolvedValue({}),
    getRepositories: jest.fn().mockResolvedValue([]),
    getOllamaStatus: jest.fn().mockResolvedValue({ available: false }),
    clearOllamaCache: jest.fn().mockResolvedValue({}),
    startGitHubOAuth: jest.fn().mockResolvedValue({}),
    startGoogleOAuth: jest.fn().mockResolvedValue({}),
    startLinkedInOAuth: jest.fn().mockResolvedValue({}),
  };
};

export const setupLocalStorageMock = (data = {}) => {
  // Reset the mock
  localStorage.getItem.mockReset();
  localStorage.setItem.mockReset();
  localStorage.removeItem.mockReset();
  
  const store = { ...data };
  
  localStorage.getItem.mockImplementation((key) => store[key] || null);
  localStorage.setItem.mockImplementation((key, value) => {
    store[key] = String(value);
  });
  localStorage.removeItem.mockImplementation((key) => {
    delete store[key];
  });
  
  return store;
};

export const expectLocalStorageCall = (key, value) => {
  expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
};

export const expectElectronAPICall = (method, args) => {
  expect(window.electronAPI[method]).toHaveBeenCalledWith(...args);
};

module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.spec.js'],
  testPathIgnorePatterns: [
    '<rootDir>/src/__tests__/__mocks__/',
    '<rootDir>/node_modules/',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(octokit|@octokit)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/main.js',
    '!src/preload.js',
    '!src/**/*.css',
    '!src/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
};

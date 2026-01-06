module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/test-cases/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../src/$1',
  },
  collectCoverageFrom: [
    'framework/**/*.ts',
    'test-cases/**/*.ts',
  ],
  coverageDirectory: '<rootDir>/reports/coverage',
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'UAT Test Report',
        outputPath: '<rootDir>/reports/test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};

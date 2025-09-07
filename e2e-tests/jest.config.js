module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'jest-environment-puppeteer',
  setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-node/register'
  },
  collectCoverageFrom: [
    'tests/**/*.{ts,tsx}',
    '!tests/**/*.d.ts',
    '!tests/fixtures/**',
    '!tests/utils/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov'],
  testTimeout: 60000,
  globalSetup: '<rootDir>/setup/global.setup.js',
  globalTeardown: '<rootDir>/setup/global.teardown.js',
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './reports',
      filename: 'e2e-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Speech App E2E Test Results'
    }]
  ],
  // Custom test environments for different test types
  projects: [
    {
      displayName: 'Frontend E2E',
      testMatch: ['<rootDir>/tests/frontend/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js']
    },
    {
      displayName: 'Mobile Web E2E',
      testMatch: ['<rootDir>/tests/mobile/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js']
    },
    {
      displayName: 'Cross-browser',
      testMatch: ['<rootDir>/tests/cross-browser/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js']
    },
    {
      displayName: 'Visual Regression',
      testMatch: ['<rootDir>/tests/visual/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: [
        '<rootDir>/setup/jest.setup.js',
        '<rootDir>/setup/visual.setup.js'
      ]
    },
    {
      displayName: 'Performance',
      testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: ['<rootDir>/setup/jest.setup.js']
    },
    {
      displayName: 'Accessibility',
      testMatch: ['<rootDir>/tests/accessibility/**/*.test.ts'],
      testEnvironment: 'jest-environment-puppeteer',
      setupFilesAfterEnv: [
        '<rootDir>/setup/jest.setup.js',
        '<rootDir>/setup/accessibility.setup.js'
      ]
    }
  ]
};
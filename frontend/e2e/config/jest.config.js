module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'node',
  testMatch: ['**/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/e2e/config/setup.js'],
  testTimeout: 60000,
  globalSetup: '<rootDir>/e2e/config/globalSetup.js',
  globalTeardown: '<rootDir>/e2e/config/globalTeardown.js',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
// E2E test setup
const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

// Configure image snapshot testing
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  threshold: 0.2,
  comparisonMethod: 'pixelmatch',
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });

// Global test utilities
global.testUtils = {
  // Wait for network to be idle
  waitForNetworkIdle: async (page, timeout = 5000) => {
    await page.waitForLoadState('networkidle', { timeout });
  },

  // Wait for element to be visible and stable
  waitForStableElement: async (page, selector, timeout = 5000) => {
    await page.waitForSelector(selector, { visible: true, timeout });
    await page.waitForTimeout(500); // Allow for animations
  },

  // Take screenshot with consistent viewport
  takeScreenshot: async (page, name) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    return await page.screenshot({
      path: `e2e/screenshots/${name}.png`,
      fullPage: true
    });
  },

  // Login helper
  login: async (page, email = 'test@example.com', password = 'TestPass123') => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  },

  // Audio file upload helper
  uploadAudioFile: async (page, filePath) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
    await page.waitForSelector('[data-testid="upload-progress"]');
  }
};

// Console error tracking
let consoleErrors = [];
global.beforeEach = async () => {
  consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
};

global.afterEach = async () => {
  if (consoleErrors.length > 0) {
    console.warn('Console errors detected:', consoleErrors);
  }
};
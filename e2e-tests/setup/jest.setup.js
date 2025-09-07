const { configureToMatchImageSnapshot } = require('jest-image-snapshot');
const path = require('path');

// Configure image snapshots
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: {
    threshold: 0.1,
    includeAA: false,
  },
  customSnapshotsDir: path.join(__dirname, '..', 'screenshots', 'snapshots'),
  customDiffDir: path.join(__dirname, '..', 'screenshots', 'diffs'),
  storeReceivedOnFailure: true,
});

expect.extend({ toMatchImageSnapshot });

// Global test timeout
jest.setTimeout(60000);

// Global setup for all tests
beforeAll(async () => {
  // Wait for the page to be available
  await page.setDefaultTimeout(30000);
  await page.setDefaultNavigationTimeout(30000);
  
  // Set viewport for consistent screenshots
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });

  // Enable console logging in tests (optional)
  if (process.env.DEBUG === 'true') {
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; ++i) {
        console.log(`${i}: ${msg.args()[i]}`);
      }
    });
    
    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
    
    page.on('requestfailed', request => {
      console.error('Request failed:', request.url(), request.failure().errorText);
    });
  }
});

beforeEach(async () => {
  // Clear cookies and local storage before each test
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

afterEach(async () => {
  // Take screenshot on test failure
  if (global.currentTest && global.currentTest.result && global.currentTest.result.failureMessages.length > 0) {
    const testName = global.currentTest.description || 'unknown-test';
    const screenshotPath = path.join(__dirname, '..', 'screenshots', 'failures', `${testName}-failure.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`Screenshot saved: ${screenshotPath}`);
  }
});

// Add custom test utilities
global.testUtils = {
  waitForElement: async (selector, timeout = 10000) => {
    await page.waitForSelector(selector, { timeout });
    return page.$(selector);
  },
  
  waitForText: async (text, timeout = 10000) => {
    await page.waitForFunction(
      text => document.body.innerText.includes(text),
      { timeout },
      text
    );
  },
  
  clearAndType: async (selector, text) => {
    await page.focus(selector);
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.type(selector, text);
  },
  
  takeScreenshot: async (name) => {
    const screenshotPath = path.join(__dirname, '..', 'screenshots', `${name}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    return screenshotPath;
  },
  
  scrollToElement: async (selector) => {
    await page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
    await page.waitForTimeout(500); // Wait for scroll animation
  }
};

// Store current test info for cleanup
beforeEach(() => {
  global.currentTest = expect.getState().currentTestName ? {
    description: expect.getState().currentTestName,
    result: { failureMessages: [] }
  } : null;
});

// Monkey patch to capture test results
const originalIt = global.it;
global.it = (description, fn, timeout) => {
  return originalIt(description, async () => {
    global.currentTest = { description, result: { failureMessages: [] } };
    try {
      await fn();
    } catch (error) {
      global.currentTest.result.failureMessages = [error.message];
      throw error;
    }
  }, timeout);
};
// Visual regression testing setup
const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

// Configure visual regression testing with custom settings
const customConfig = {
  threshold: 0.2, // Allow 20% pixel difference
  comparisonMethod: 'pixelmatch',
  customDiffConfig: {
    threshold: 0.1,
    includeAA: false,
    alpha: 0.64,
    aaColor: [255, 0, 255],
    diffColor: [255, 0, 0],
    diffColorAlt: null,
  },
  failureThreshold: 0.01, // Fail if more than 1% of pixels differ
  failureThresholdType: 'percent',
  allowSizeMismatch: false,
  storeReceivedOnFailure: true,
  updatePassedSnapshot: false,
  customSnapshotIdentifier: ({ testPath, currentTestName, counter }) => {
    const testName = currentTestName.replace(/\s+/g, '-').toLowerCase();
    const fileName = testPath.split('/').pop().replace('.test.ts', '');
    return `${fileName}-${testName}-${counter}`;
  }
};

const toMatchImageSnapshot = configureToMatchImageSnapshot(customConfig);
expect.extend({ toMatchImageSnapshot });

// Helper functions for visual testing
global.visualTestUtils = {
  // Take a full page screenshot with element masking
  takeVisualSnapshot: async (name, options = {}) => {
    const {
      maskElements = [],
      hideElements = [],
      waitForSelector = null,
      clip = null,
      fullPage = true
    } = options;
    
    // Wait for specific element if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 });
    }
    
    // Hide elements that might cause visual noise
    if (hideElements.length > 0) {
      await page.evaluate((selectors) => {
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.visibility = 'hidden';
          });
        });
      }, hideElements);
    }
    
    // Mask elements with solid color (useful for dynamic content)
    if (maskElements.length > 0) {
      await page.evaluate((selectors) => {
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.backgroundColor = '#cccccc';
            el.style.color = '#cccccc';
          });
        });
      }, maskElements);
    }
    
    // Take screenshot
    const screenshot = await page.screenshot({
      fullPage,
      clip,
      type: 'png'
    });
    
    // Restore hidden elements
    if (hideElements.length > 0) {
      await page.evaluate((selectors) => {
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.visibility = '';
          });
        });
      }, hideElements);
    }
    
    // Restore masked elements
    if (maskElements.length > 0) {
      await page.evaluate((selectors) => {
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.backgroundColor = '';
            el.style.color = '';
          });
        });
      }, maskElements);
    }
    
    return screenshot;
  },
  
  // Wait for all images to load
  waitForImagesLoaded: async () => {
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve;
          }))
      );
    });
  },
  
  // Wait for animations to complete
  waitForAnimations: async (timeout = 2000) => {
    await page.waitForTimeout(timeout);
    
    // Wait for CSS animations to complete
    await page.evaluate(() => {
      return Promise.all(
        document.getAnimations().map(animation => animation.finished)
      );
    });
  },
  
  // Stabilize page for consistent screenshots
  stabilizePage: async () => {
    // Wait for images to load
    await global.visualTestUtils.waitForImagesLoaded();
    
    // Wait for animations to complete
    await global.visualTestUtils.waitForAnimations();
    
    // Scroll to top to ensure consistent viewport
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    // Wait a bit more for any final rendering
    await page.waitForTimeout(500);
  }
};

// Set consistent viewport for visual tests
beforeEach(async () => {
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  
  // Disable smooth scrolling for consistent screenshots
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  });
});
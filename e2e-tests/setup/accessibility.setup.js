const { injectAxe, checkA11y, getViolations } = require('@axe-core/puppeteer');

// Accessibility testing setup
beforeEach(async () => {
  // Inject axe-core into the page
  await injectAxe(page);
});

// Helper functions for accessibility testing
global.a11yTestUtils = {
  // Run accessibility audit on the current page
  auditPage: async (options = {}) => {
    const {
      include = [],
      exclude = [],
      rules = {},
      tags = ['wcag2a', 'wcag2aa', 'wcag21aa']
    } = options;
    
    try {
      await checkA11y(page, null, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: tags
          },
          rules,
          include,
          exclude
        }
      });
      
      return { passed: true, violations: [] };
    } catch (error) {
      const violations = await getViolations(page);
      return { passed: false, violations };
    }
  },
  
  // Check specific element for accessibility issues
  auditElement: async (selector, options = {}) => {
    const {
      rules = {},
      tags = ['wcag2a', 'wcag2aa', 'wcag21aa']
    } = options;
    
    try {
      await checkA11y(page, selector, {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: tags
          },
          rules
        }
      });
      
      return { passed: true, violations: [] };
    } catch (error) {
      const violations = await getViolations(page);
      return { passed: false, violations };
    }
  },
  
  // Test keyboard navigation
  testKeyboardNavigation: async (expectedStops = []) => {
    const focusableElements = [];
    
    // Start from the top of the page
    await page.evaluate(() => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
    });
    
    // Tab through all focusable elements
    let currentElement = null;
    let attempts = 0;
    const maxAttempts = 50; // Prevent infinite loops
    
    while (attempts < maxAttempts) {
      await page.keyboard.press('Tab');
      attempts++;
      
      const newActiveElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (el && el !== document.body) {
          return {
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            role: el.getAttribute('role'),
            ariaLabel: el.getAttribute('aria-label'),
            text: el.textContent?.trim().substring(0, 50)
          };
        }
        return null;
      });
      
      if (!newActiveElement || 
          (currentElement && 
           newActiveElement.tagName === currentElement.tagName &&
           newActiveElement.className === currentElement.className &&
           newActiveElement.id === currentElement.id)) {
        break;
      }
      
      focusableElements.push(newActiveElement);
      currentElement = newActiveElement;
    }
    
    return {
      totalFocusableElements: focusableElements.length,
      elements: focusableElements,
      expectedStopsFound: expectedStops.every(stop => 
        focusableElements.some(el => 
          el.tagName.toLowerCase() === stop.tagName?.toLowerCase() ||
          el.className.includes(stop.className) ||
          el.id === stop.id ||
          el.ariaLabel === stop.ariaLabel
        )
      )
    };
  },
  
  // Test screen reader announcements
  testScreenReaderAnnouncements: async () => {
    const ariaLiveRegions = await page.evaluate(() => {
      const regions = document.querySelectorAll('[aria-live]');
      return Array.from(regions).map(region => ({
        tagName: region.tagName,
        ariaLive: region.getAttribute('aria-live'),
        text: region.textContent?.trim(),
        className: region.className,
        id: region.id
      }));
    });
    
    const ariaLabels = await page.evaluate(() => {
      const labeledElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
      return Array.from(labeledElements).map(el => ({
        tagName: el.tagName,
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledby: el.getAttribute('aria-labelledby'),
        ariaDescribedby: el.getAttribute('aria-describedby'),
        className: el.className,
        id: el.id
      }));
    });
    
    return {
      liveRegions: ariaLiveRegions,
      labeledElements: ariaLabels
    };
  },
  
  // Check color contrast
  checkColorContrast: async () => {
    const contrastResults = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const results = [];
      
      for (const el of elements) {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        const fontSize = parseFloat(style.fontSize);
        
        if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
          results.push({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            color,
            backgroundColor,
            fontSize,
            text: el.textContent?.trim().substring(0, 50)
          });
        }
      }
      
      return results;
    });
    
    return contrastResults;
  },
  
  // Format violation report
  formatViolations: (violations) => {
    return violations.map(violation => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map(node => ({
        html: node.html,
        target: node.target,
        failureSummary: node.failureSummary
      }))
    }));
  }
};
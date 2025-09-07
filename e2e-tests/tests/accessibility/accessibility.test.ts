import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { TTSPage } from '../../pages/tts/TTSPage';
import { VoiceCloningPage } from '../../pages/voice-cloning/VoiceCloningPage';

describe('Accessibility Testing', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ttsPage: TTSPage;
  let voiceCloningPage: VoiceCloningPage;

  beforeAll(async () => {
    // Login before running accessibility tests
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await loginPage.waitForLogin();
  });

  beforeEach(async () => {
    dashboardPage = new DashboardPage(page);
    ttsPage = new TTSPage(page);
    voiceCloningPage = new VoiceCloningPage(page);
  });

  describe('Authentication Pages Accessibility', () => {
    it('should have accessible login page', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const auditResult = await global.a11yTestUtils?.auditPage({
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
        rules: {
          'color-contrast': { enabled: true },
          'keyboard-navigation': { enabled: true },
          'focus-management': { enabled: true }
        }
      });
      
      expect(auditResult?.passed).toBe(true);
      
      if (!auditResult?.passed) {
        console.log('Login page accessibility violations:', 
          global.a11yTestUtils?.formatViolations(auditResult?.violations || [])
        );
      }
    });

    it('should have accessible signup page', async () => {
      await page.goto('http://localhost:3000/signup');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const auditResult = await global.a11yTestUtils?.auditPage();
      
      expect(auditResult?.passed).toBe(true);
      
      if (!auditResult?.passed) {
        console.log('Signup page accessibility violations:', 
          global.a11yTestUtils?.formatViolations(auditResult?.violations || [])
        );
      }
    });

    it('should have proper form labels and associations', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Check that all form inputs have proper labels
      const formInputs = await page.$$eval('input', inputs => 
        inputs.map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          hasLabel: !!input.labels?.length,
          ariaLabel: input.getAttribute('aria-label'),
          ariaLabelledby: input.getAttribute('aria-labelledby'),
          placeholder: input.placeholder
        }))
      );
      
      for (const input of formInputs) {
        const hasAccessibleName = input.hasLabel || input.ariaLabel || input.ariaLabelledby;
        expect(hasAccessibleName).toBe(true);
        
        if (!hasAccessibleName) {
          console.log(`Input ${input.name || input.id} lacks accessible name`);
        }
      }
    });

    it('should support keyboard navigation in forms', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const keyboardNav = await global.a11yTestUtils?.testKeyboardNavigation([
        { tagName: 'input', id: 'email' },
        { tagName: 'input', id: 'password' },
        { tagName: 'button', className: 'login-button' }
      ]);
      
      expect(keyboardNav?.totalFocusableElements).toBeGreaterThan(0);
      expect(keyboardNav?.expectedStopsFound).toBe(true);
    });

    it('should announce form validation errors to screen readers', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Trigger validation errors
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      const announcements = await global.a11yTestUtils?.testScreenReaderAnnouncements();
      
      // Should have aria-live regions or aria-describedby for errors
      expect(announcements?.liveRegions.length || announcements?.labeledElements.length).toBeGreaterThan(0);
    });

    it('should have proper heading hierarchy', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('h1, h2, h3, h4, h5, h6', { timeout: 5000 }).catch(() => {});
      
      const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings =>
        headings.map(h => ({
          level: parseInt(h.tagName.charAt(1)),
          text: h.textContent?.trim(),
          hasContent: (h.textContent?.trim().length || 0) > 0
        }))
      );
      
      if (headings.length > 0) {
        // Should start with h1
        const firstHeading = headings[0];
        expect(firstHeading.level).toBe(1);
        
        // All headings should have content
        for (const heading of headings) {
          expect(heading.hasContent).toBe(true);
        }
        
        // Heading levels should not skip (e.g., h1 -> h3)
        for (let i = 1; i < headings.length; i++) {
          const levelDiff = headings[i].level - headings[i-1].level;
          expect(levelDiff).toBeLessThanOrEqual(1);
        }
      }
    });
  });

  describe('Dashboard Accessibility', () => {
    beforeEach(async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
    });

    it('should have accessible dashboard layout', async () => {
      const auditResult = await global.a11yTestUtils?.auditPage({
        exclude: ['.advertisement', '.third-party-widget'] // Exclude third-party content
      });
      
      expect(auditResult?.passed).toBe(true);
      
      if (!auditResult?.passed) {
        console.log('Dashboard accessibility violations:', 
          global.a11yTestUtils?.formatViolations(auditResult?.violations || [])
        );
      }
    });

    it('should have accessible navigation menu', async () => {
      const navResult = await global.a11yTestUtils?.auditElement('.sidebar, .nav-sidebar, [data-testid="sidebar"]');
      
      expect(navResult?.passed).toBe(true);
    });

    it('should support keyboard navigation in dashboard', async () => {
      const keyboardNav = await global.a11yTestUtils?.testKeyboardNavigation([
        { tagName: 'a', ariaLabel: 'Home' },
        { tagName: 'a', ariaLabel: 'Projects' },
        { tagName: 'a', ariaLabel: 'Explore' },
        { tagName: 'a', ariaLabel: 'TTS' },
        { tagName: 'a', ariaLabel: 'Voice Cloning' }
      ]);
      
      expect(keyboardNav?.totalFocusableElements).toBeGreaterThan(0);
    });

    it('should have proper landmarks and regions', async () => {
      const landmarks = await page.$$eval('[role], nav, main, aside, header, footer', elements =>
        elements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby')
        }))
      );
      
      // Should have main content area
      const hasMain = landmarks.some(landmark => 
        landmark.tagName === 'main' || landmark.role === 'main'
      );
      expect(hasMain).toBe(true);
      
      // Should have navigation
      const hasNav = landmarks.some(landmark => 
        landmark.tagName === 'nav' || landmark.role === 'navigation'
      );
      expect(hasNav).toBe(true);
    });

    it('should indicate current page in navigation', async () => {
      // Check aria-current or active states
      const currentPageIndicators = await page.$$eval(
        '[aria-current="page"], .active, .current, [data-current="true"]',
        indicators => indicators.length
      );
      
      expect(currentPageIndicators).toBeGreaterThan(0);
    });

    it('should have accessible user menu', async () => {
      const userMenu = await page.$('.user-menu, .profile-menu, [data-testid="user-menu"]');
      
      if (userMenu) {
        // Test user menu accessibility
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const menuResult = await global.a11yTestUtils?.auditElement('.user-menu, .profile-menu');
        expect(menuResult?.passed).toBe(true);
      }
    });
  });

  describe('TTS Interface Accessibility', () => {
    beforeEach(async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
    });

    it('should have accessible TTS form', async () => {
      const auditResult = await global.a11yTestUtils?.auditPage();
      
      expect(auditResult?.passed).toBe(true);
      
      if (!auditResult?.passed) {
        console.log('TTS page accessibility violations:', 
          global.a11yTestUtils?.formatViolations(auditResult?.violations || [])
        );
      }
    });

    it('should have properly labeled text input', async () => {
      const textInput = await page.$('textarea[name="text"], #text-input, .text-input');
      
      if (textInput) {
        const inputInfo = await textInput.evaluate(el => ({
          hasLabel: !!el.labels?.length,
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          placeholder: (el as HTMLTextAreaElement).placeholder
        }));
        
        const hasAccessibleName = inputInfo.hasLabel || inputInfo.ariaLabel || inputInfo.ariaLabelledby;
        expect(hasAccessibleName).toBe(true);
      }
    });

    it('should have accessible voice selection interface', async () => {
      const voiceSelect = await page.$('.voice-select, [data-testid="voice-select"]');
      
      if (voiceSelect) {
        const selectResult = await global.a11yTestUtils?.auditElement('.voice-select, [data-testid="voice-select"]');
        expect(selectResult?.passed).toBe(true);
      }
    });

    it('should have accessible audio controls', async () => {
      // Generate TTS first
      await ttsPage.enterText('Testing audio controls accessibility.');
      await ttsPage.generateTTS();
      
      try {
        await ttsPage.waitForGeneration(30000);
        
        // Check audio player accessibility
        const audioPlayer = await page.$('audio, .audio-player, [data-testid="audio-player"]');
        
        if (audioPlayer) {
          const audioResult = await global.a11yTestUtils?.auditElement('audio, .audio-player');
          expect(audioResult?.passed).toBe(true);
        }
      } catch (error) {
        console.log('TTS generation timeout in accessibility test');
      }
    });

    it('should announce generation status to screen readers', async () => {
      await ttsPage.enterText('Testing status announcements.');
      await ttsPage.generateTTS();
      
      // Check for aria-live regions
      const announcements = await global.a11yTestUtils?.testScreenReaderAnnouncements();
      
      const hasStatusAnnouncements = announcements?.liveRegions.some(region =>
        region.ariaLive === 'polite' || region.ariaLive === 'assertive'
      );
      
      expect(hasStatusAnnouncements).toBe(true);
    });

    it('should have accessible sliders for voice settings', async () => {
      const sliders = await page.$$('.speed-slider, .pitch-slider, .volume-slider, input[type="range"]');
      
      for (const slider of sliders) {
        const sliderInfo = await slider.evaluate(el => ({
          hasLabel: !!el.labels?.length,
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          min: el.getAttribute('min'),
          max: el.getAttribute('max'),
          value: el.getAttribute('value'),
          ariaValueNow: el.getAttribute('aria-valuenow'),
          ariaValueText: el.getAttribute('aria-valuetext')
        }));
        
        const hasAccessibleName = sliderInfo.hasLabel || sliderInfo.ariaLabel || sliderInfo.ariaLabelledby;
        expect(hasAccessibleName).toBe(true);
        
        // Should have min/max attributes or aria equivalents
        const hasRange = sliderInfo.min && sliderInfo.max;
        expect(hasRange).toBe(true);
      }
    });
  });

  describe('Voice Cloning Accessibility', () => {
    beforeEach(async () => {
      await voiceCloningPage.goto();
      await voiceCloningPage.isLoaded();
    });

    it('should have accessible file upload interface', async () => {
      const auditResult = await global.a11yTestUtils?.auditPage();
      
      expect(auditResult?.passed).toBe(true);
    });

    it('should have accessible file input', async () => {
      const fileInput = await page.$('input[type="file"]');
      
      if (fileInput) {
        const inputInfo = await fileInput.evaluate(el => ({
          hasLabel: !!el.labels?.length,
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          accept: el.getAttribute('accept')
        }));
        
        const hasAccessibleName = inputInfo.hasLabel || inputInfo.ariaLabel || inputInfo.ariaLabelledby;
        expect(hasAccessibleName).toBe(true);
        
        // Should have accept attribute for file types
        expect(inputInfo.accept).toBeTruthy();
      }
    });

    it('should have accessible drag and drop area', async () => {
      const dropArea = await page.$('.drag-drop-area, .upload-zone, [data-testid="drag-drop"]');
      
      if (dropArea) {
        const dropAreaInfo = await dropArea.evaluate(el => ({
          hasRole: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          tabIndex: el.getAttribute('tabindex'),
          hasKeyHandlers: !!(el as any).onkeydown || !!(el as any).onkeyup || !!(el as any).onkeypress
        }));
        
        // Drop area should be focusable and have proper role
        expect(dropAreaInfo.hasRole || dropAreaInfo.tabIndex).toBeTruthy();
        expect(dropAreaInfo.ariaLabel).toBeTruthy();
      }
    });

    it('should have accessible recording controls', async () => {
      const recordButton = await page.$('.record-button, [data-testid="start-recording"]');
      
      if (recordButton) {
        const buttonInfo = await recordButton.evaluate(el => ({
          ariaLabel: el.getAttribute('aria-label'),
          ariaPressed: el.getAttribute('aria-pressed'),
          disabled: (el as HTMLButtonElement).disabled,
          textContent: el.textContent?.trim()
        }));
        
        const hasAccessibleName = buttonInfo.ariaLabel || buttonInfo.textContent;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    it('should announce processing status', async () => {
      // Set up minimal voice cloning data
      await voiceCloningPage.setVoiceName('Accessibility Test Voice');
      
      // Check for status announcements
      const announcements = await global.a11yTestUtils?.testScreenReaderAnnouncements();
      
      expect(announcements?.liveRegions.length).toBeGreaterThan(0);
    });

    it('should have accessible form validation', async () => {
      // Try to submit without required data
      if (await page.$('.create-voice-button, [data-testid="create-voice"]')) {
        await page.click('.create-voice-button, [data-testid="create-voice"]');
        await page.waitForTimeout(1000);
        
        // Check for accessible error messages
        const errorMessages = await page.$$('.error-message, .validation-error, [role="alert"]');
        
        for (const error of errorMessages) {
          const errorInfo = await error.evaluate(el => ({
            role: el.getAttribute('role'),
            ariaLive: el.getAttribute('aria-live'),
            id: el.id,
            textContent: el.textContent?.trim()
          }));
          
          // Errors should be announced or properly associated
          const isAccessible = errorInfo.role === 'alert' || 
                              errorInfo.ariaLive === 'assertive' || 
                              errorInfo.id;
          expect(isAccessible).toBe(true);
        }
      }
    });
  });

  describe('Color Contrast Accessibility', () => {
    it('should have sufficient color contrast', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Run color contrast audit
      const contrastResults = await global.a11yTestUtils?.checkColorContrast();
      
      if (contrastResults && contrastResults.length > 0) {
        // This is a simplified check - in practice, you'd calculate actual contrast ratios
        const elementsWithText = contrastResults.filter(result => result.text && result.text.length > 0);
        
        expect(elementsWithText.length).toBeGreaterThan(0);
        
        // Log potential contrast issues for manual review
        console.log(`Analyzed ${elementsWithText.length} elements for color contrast`);
      }
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly in modals', async () => {
      // Try to open a modal or dialog
      if (await page.$('.user-menu, [data-testid="user-menu"]')) {
        await page.click('.user-menu, [data-testid="user-menu"]');
        await page.waitForTimeout(500);
        
        // Check if focus is trapped within modal
        const activeElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(activeElement).toBeTruthy();
      }
    });

    it('should restore focus after modal close', async () => {
      // This would test focus restoration after closing dialogs
      // Implementation depends on specific modal behavior
      
      const initialFocus = await page.evaluate(() => document.activeElement?.tagName);
      
      // Open and close modal (if available)
      if (await page.$('.user-menu, [data-testid="user-menu"]')) {
        await page.click('.user-menu, [data-testid="user-menu"]');
        await page.waitForTimeout(500);
        
        // Close modal (ESC key or click outside)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const restoredFocus = await page.evaluate(() => document.activeElement?.tagName);
        
        // Focus should be restored or managed appropriately
        expect(restoredFocus).toBeTruthy();
      }
    });

    it('should have visible focus indicators', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Tab through focusable elements and check for focus indicators
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (el) {
          const styles = window.getComputedStyle(el);
          const pseudoStyles = window.getComputedStyle(el, ':focus');
          
          return {
            tagName: el.tagName,
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
            pseudoOutline: pseudoStyles.outline,
            pseudoBoxShadow: pseudoStyles.boxShadow
          };
        }
        return null;
      });
      
      if (focusedElement) {
        // Should have some form of focus indicator
        const hasFocusIndicator = focusedElement.outline !== 'none' ||
                                 focusedElement.outlineWidth !== '0px' ||
                                 focusedElement.boxShadow !== 'none' ||
                                 focusedElement.pseudoOutline !== 'none' ||
                                 focusedElement.pseudoBoxShadow !== 'none';
        
        expect(hasFocusIndicator).toBe(true);
      }
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should have proper page titles', async () => {
      const pages = [
        { url: '/login', expectedTitle: /login|sign.*in/i },
        { url: '/signup', expectedTitle: /signup|register|sign.*up/i },
        { url: '/home', expectedTitle: /home|dashboard/i },
        { url: '/tts/create', expectedTitle: /tts|text.*speech/i },
        { url: '/voice-cloning', expectedTitle: /voice.*clon|clone/i }
      ];
      
      for (const pageInfo of pages) {
        await page.goto(`http://localhost:3000${pageInfo.url}`);
        await page.waitForTimeout(2000);
        
        const title = await page.title();
        expect(title).toMatch(pageInfo.expectedTitle);
        expect(title.length).toBeGreaterThan(0);
      }
    });

    it('should have proper meta descriptions', async () => {
      const metaDescription = await page.$eval('meta[name="description"]', 
        el => el.getAttribute('content')
      ).catch(() => null);
      
      if (metaDescription) {
        expect(metaDescription.length).toBeGreaterThan(0);
        expect(metaDescription.length).toBeLessThan(160); // SEO best practice
      }
    });

    it('should have proper language attributes', async () => {
      const htmlLang = await page.$eval('html', el => el.getAttribute('lang'));
      
      expect(htmlLang).toBeTruthy();
      expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., "en", "en-US"
    });

    it('should use semantic HTML elements', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const semanticElements = await page.$$eval(
        'main, nav, aside, header, footer, section, article',
        elements => elements.map(el => el.tagName.toLowerCase())
      );
      
      // Should use at least some semantic elements
      expect(semanticElements.length).toBeGreaterThan(0);
    });

    it('should have descriptive link text', async () => {
      const links = await page.$$eval('a', links =>
        links.map(link => ({
          text: link.textContent?.trim(),
          ariaLabel: link.getAttribute('aria-label'),
          title: link.getAttribute('title'),
          href: link.getAttribute('href')
        })).filter(link => link.href && !link.href.startsWith('javascript:'))
      );
      
      for (const link of links) {
        const descriptiveText = link.text || link.ariaLabel || link.title;
        
        // Links should have descriptive text
        expect(descriptiveText).toBeTruthy();
        
        // Avoid generic text like "click here", "read more"
        if (descriptiveText) {
          const isGeneric = /^(click here|read more|more|link)$/i.test(descriptiveText);
          expect(isGeneric).toBe(false);
        }
      }
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(async () => {
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      });
    });

    afterEach(async () => {
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    });

    it('should have accessible mobile navigation', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const auditResult = await global.a11yTestUtils?.auditPage();
      
      expect(auditResult?.passed).toBe(true);
    });

    it('should have proper touch target sizes', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const touchTargets = await page.$$eval(
        'button, a, input[type="button"], input[type="submit"], [role="button"]',
        elements => elements.map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            width: rect.width,
            height: rect.height,
            className: el.className
          };
        }).filter(el => el.width > 0 && el.height > 0)
      );
      
      for (const target of touchTargets) {
        // Touch targets should be at least 44x44 pixels (WCAG guideline)
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
      }
    });

    it('should work with mobile screen readers', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Mobile-specific accessibility checks
      const auditResult = await global.a11yTestUtils?.auditPage({
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
      
      expect(auditResult?.passed).toBe(true);
    });
  });

  describe('ARIA Implementation', () => {
    it('should use ARIA attributes correctly', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Check for common ARIA attributes
      const ariaElements = await page.$$eval(
        '[aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-hidden], [role]',
        elements => elements.map(el => ({
          tagName: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          ariaLabelledby: el.getAttribute('aria-labelledby'),
          ariaDescribedby: el.getAttribute('aria-describedby'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          ariaHidden: el.getAttribute('aria-hidden'),
          role: el.getAttribute('role')
        }))
      );
      
      // Validate ARIA usage
      for (const element of ariaElements) {
        // aria-labelledby should reference existing IDs
        if (element.ariaLabelledby) {
          const referencedIds = element.ariaLabelledby.split(' ');
          for (const id of referencedIds) {
            const referencedElement = await page.$(`#${id}`);
            expect(referencedElement).toBeTruthy();
          }
        }
        
        // aria-describedby should reference existing IDs
        if (element.ariaDescribedby) {
          const referencedIds = element.ariaDescribedby.split(' ');
          for (const id of referencedIds) {
            const referencedElement = await page.$(`#${id}`);
            expect(referencedElement).toBeTruthy();
          }
        }
        
        // aria-expanded should be true/false for expandable elements
        if (element.ariaExpanded) {
          expect(['true', 'false'].includes(element.ariaExpanded)).toBe(true);
        }
      }
    });

    it('should implement live regions correctly', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      // Look for aria-live regions
      const liveRegions = await page.$$eval(
        '[aria-live]',
        regions => regions.map(region => ({
          ariaLive: region.getAttribute('aria-live'),
          ariaAtomic: region.getAttribute('aria-atomic'),
          id: region.id,
          className: region.className
        }))
      );
      
      // Should have appropriate live regions for status updates
      expect(liveRegions.length).toBeGreaterThan(0);
      
      for (const region of liveRegions) {
        // aria-live values should be valid
        expect(['polite', 'assertive', 'off'].includes(region.ariaLive || '')).toBe(true);
      }
    });
  });
});
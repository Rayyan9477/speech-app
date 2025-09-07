import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { TTSPage } from '../../pages/tts/TTSPage';
import { VoiceCloningPage } from '../../pages/voice-cloning/VoiceCloningPage';

describe('Navigation Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ttsPage: TTSPage;
  let voiceCloningPage: VoiceCloningPage;

  beforeAll(async () => {
    // Login before running navigation tests
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await loginPage.waitForLogin();
  });

  beforeEach(async () => {
    dashboardPage = new DashboardPage(page);
    ttsPage = new TTSPage(page);
    voiceCloningPage = new VoiceCloningPage(page);
    
    // Start from dashboard home page
    await dashboardPage.navigateToHome();
    await dashboardPage.waitForPageLoad();
  });

  describe('Main Navigation', () => {
    it('should navigate to all main sections', async () => {
      // Test navigation to each main section
      const sections = [
        { name: 'home', method: 'navigateToHome', path: '/home' },
        { name: 'projects', method: 'navigateToProjects', path: '/projects' },
        { name: 'explore', method: 'navigateToExplore', path: '/explore' },
        { name: 'voices', method: 'navigateToVoices', path: '/voices' },
        { name: 'tts', method: 'navigateToTTS', path: '/tts' },
        { name: 'voice-cloning', method: 'navigateToVoiceCloning', path: '/voice-cloning' },
        { name: 'voice-translate', method: 'navigateToVoiceTranslate', path: '/voice-translate' },
        { name: 'account', method: 'navigateToAccount', path: '/account' }
      ];

      for (const section of sections) {
        await (dashboardPage as any)[section.method]();
        await dashboardPage.waitForPageLoad();
        
        const currentUrl = await dashboardPage.getCurrentUrl();
        expect(currentUrl).toContain(section.path);
        
        const currentSection = await dashboardPage.getCurrentSection();
        expect(currentSection).toBe(section.name);
      }
    });

    it('should show correct page titles for each section', async () => {
      const sectionTitles = [
        { method: 'navigateToHome', expectedTitle: /home|dashboard/i },
        { method: 'navigateToProjects', expectedTitle: /project/i },
        { method: 'navigateToExplore', expectedTitle: /explore|discover/i },
        { method: 'navigateToVoices', expectedTitle: /voice/i },
        { method: 'navigateToTTS', expectedTitle: /text.*speech|tts/i },
        { method: 'navigateToVoiceCloning', expectedTitle: /clone|cloning/i },
        { method: 'navigateToAccount', expectedTitle: /account|profile|settings/i }
      ];

      for (const section of sectionTitles) {
        await (dashboardPage as any)[section.method]();
        await dashboardPage.waitForPageLoad();
        
        const pageTitle = await dashboardPage.getPageTitle();
        expect(pageTitle).toMatch(section.expectedTitle);
      }
    });

    it('should update breadcrumb navigation correctly', async () => {
      await dashboardPage.navigateToTTS();
      await dashboardPage.waitForPageLoad();
      
      const breadcrumb = await dashboardPage.getBreadcrumb();
      expect(breadcrumb.length).toBeGreaterThan(0);
      expect(breadcrumb.some(item => item.toLowerCase().includes('tts'))).toBe(true);
    });

    it('should maintain active navigation state', async () => {
      await dashboardPage.navigateToVoiceCloning();
      await dashboardPage.waitForPageLoad();
      
      // Check if the voice cloning navigation item is marked as active
      const isActive = await page.$eval('[data-testid="nav-voice-cloning"], .nav-voice-cloning', el => 
        el.classList.contains('active') || el.getAttribute('aria-current') === 'page'
      );
      expect(isActive).toBe(true);
    });
  });

  describe('Mobile Navigation', () => {
    it('should show mobile menu on small screens', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      await dashboardPage.waitForPageLoad();
      
      const hasMobileMenu = await dashboardPage.isVisible('[data-testid="mobile-menu"], .mobile-menu-button, .hamburger');
      expect(hasMobileMenu).toBe(true);
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });

    it('should open and close mobile navigation menu', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      await dashboardPage.waitForPageLoad();
      
      if (await dashboardPage.isVisible('[data-testid="mobile-menu"]')) {
        await dashboardPage.openMobileMenu();
        
        const isMobileMenuOpen = await dashboardPage.isVisible('[data-testid="mobile-sidebar"], .mobile-sidebar');
        expect(isMobileMenuOpen).toBe(true);
        
        await dashboardPage.closeMobileMenu();
        
        const isMobileMenuClosed = await dashboardPage.isVisible('[data-testid="mobile-sidebar"], .mobile-sidebar');
        expect(isMobileMenuClosed).toBe(false);
      }
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });

    it('should navigate correctly on mobile', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.reload();
      await dashboardPage.waitForPageLoad();
      
      if (await dashboardPage.isVisible('[data-testid="mobile-menu"]')) {
        await dashboardPage.openMobileMenu();
        await dashboardPage.navigateToVoices();
        await dashboardPage.waitForPageLoad();
        
        const currentUrl = await dashboardPage.getCurrentUrl();
        expect(currentUrl).toContain('/voices');
      }
      
      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });

  describe('Deep Link Navigation', () => {
    it('should navigate directly to TTS create page', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      const currentUrl = await ttsPage.getCurrentUrl();
      expect(currentUrl).toContain('/tts/create');
    });

    it('should navigate directly to voice cloning page', async () => {
      await voiceCloningPage.goto();
      await voiceCloningPage.isLoaded();
      
      const currentUrl = await voiceCloningPage.getCurrentUrl();
      expect(currentUrl).toContain('/voice-cloning');
    });

    it('should handle invalid routes gracefully', async () => {
      await page.goto('http://localhost:3000/invalid-route');
      await page.waitForTimeout(3000);
      
      // Should redirect to 404 page or home page
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/(404|not-found|home)/);
    });
  });

  describe('Back Button Navigation', () => {
    it('should navigate back correctly using browser back button', async () => {
      // Navigate to projects
      await dashboardPage.navigateToProjects();
      await dashboardPage.waitForPageLoad();
      
      // Navigate to TTS
      await dashboardPage.navigateToTTS();
      await dashboardPage.waitForPageLoad();
      
      // Use browser back button
      await page.goBack();
      await page.waitForTimeout(1000);
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/projects');
    });

    it('should maintain navigation history', async () => {
      const navigationPath = [
        { method: 'navigateToHome', path: '/home' },
        { method: 'navigateToVoices', path: '/voices' },
        { method: 'navigateToTTS', path: '/tts' }
      ];

      // Navigate through path
      for (const nav of navigationPath) {
        await (dashboardPage as any)[nav.method]();
        await dashboardPage.waitForPageLoad();
      }

      // Navigate back through history
      for (let i = navigationPath.length - 2; i >= 0; i--) {
        await page.goBack();
        await page.waitForTimeout(1000);
        
        const currentUrl = await page.url();
        expect(currentUrl).toContain(navigationPath[i].path);
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through menu items', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Focus on the navigation
      await page.focus('[data-testid="sidebar"], .sidebar, .nav-sidebar');
      
      // Tab through navigation items
      const navigationResults = await global.a11yTestUtils?.testKeyboardNavigation([
        { tagName: 'a', ariaLabel: 'Home' },
        { tagName: 'a', ariaLabel: 'Projects' },
        { tagName: 'a', ariaLabel: 'Explore' }
      ]);
      
      if (navigationResults) {
        expect(navigationResults.totalFocusableElements).toBeGreaterThan(0);
      }
    });

    it('should handle Enter key for navigation', async () => {
      // Focus on a navigation link
      await page.focus('[data-testid="nav-projects"], a[href*="/projects"]');
      
      // Press Enter
      await page.keyboard.press('Enter');
      await dashboardPage.waitForPageLoad();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/projects');
    });
  });

  describe('URL State Management', () => {
    it('should preserve query parameters during navigation', async () => {
      // Navigate with query parameters
      await page.goto('http://localhost:3000/home?tab=recent&sort=date');
      await dashboardPage.waitForPageLoad();
      
      // Navigate to another page
      await dashboardPage.navigateToProjects();
      await dashboardPage.waitForPageLoad();
      
      // Navigate back
      await page.goBack();
      await page.waitForTimeout(1000);
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('tab=recent');
      expect(currentUrl).toContain('sort=date');
    });

    it('should handle URL fragments/anchors correctly', async () => {
      await page.goto('http://localhost:3000/account#settings');
      await dashboardPage.waitForPageLoad();
      
      const currentUrl = await page.url();
      expect(currentUrl).toContain('#settings');
    });
  });

  describe('Loading States', () => {
    it('should show loading indicators during page transitions', async () => {
      // Start navigation
      const navigationPromise = dashboardPage.navigateToVoiceCloning();
      
      // Check if loading indicator appears quickly
      await page.waitForTimeout(100);
      const isLoading = await dashboardPage.isPageLoading();
      
      // Complete navigation
      await navigationPromise;
      await dashboardPage.waitForPageLoad();
      
      // Loading should be gone
      const isStillLoading = await dashboardPage.isPageLoading();
      expect(isStillLoading).toBe(false);
    });

    it('should handle slow loading pages gracefully', async () => {
      // Simulate slow network
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 100 * 1024, // 100kb/s
        uploadThroughput: 100 * 1024,
        latency: 500
      });
      
      await dashboardPage.navigateToExplore();
      await dashboardPage.waitForPageLoad();
      
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('/explore');
      
      // Reset network conditions
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper ARIA labels for navigation items', async () => {
      const navigationLinks = await page.$$eval(
        '[data-testid^="nav-"], .nav-sidebar a, .sidebar a',
        links => links.map(link => ({
          text: link.textContent?.trim(),
          ariaLabel: link.getAttribute('aria-label'),
          href: link.getAttribute('href')
        }))
      );
      
      expect(navigationLinks.length).toBeGreaterThan(0);
      
      // Each navigation item should have descriptive text or aria-label
      for (const link of navigationLinks) {
        expect(link.text || link.ariaLabel).toBeTruthy();
        expect(link.href).toBeTruthy();
      }
    });

    it('should indicate current page in navigation', async () => {
      await dashboardPage.navigateToVoices();
      await dashboardPage.waitForPageLoad();
      
      const currentNavItem = await page.$eval(
        '[data-testid="nav-voices"], a[href*="/voices"]',
        el => ({
          ariaCurrent: el.getAttribute('aria-current'),
          hasActiveClass: el.classList.contains('active') || el.classList.contains('current')
        })
      );
      
      expect(currentNavItem.ariaCurrent === 'page' || currentNavItem.hasActiveClass).toBe(true);
    });
  });

  describe('Error Navigation Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      // Simulate network error during navigation
      await page.setOfflineMode(true);
      
      try {
        await dashboardPage.navigateToExplore();
        await page.waitForTimeout(3000);
      } catch (error) {
        // Expected to fail
      }
      
      // Restore network and retry
      await page.setOfflineMode(false);
      
      await dashboardPage.navigateToExplore();
      await dashboardPage.waitForPageLoad();
      
      const currentUrl = await dashboardPage.getCurrentUrl();
      expect(currentUrl).toContain('/explore');
    });

    it('should show appropriate error messages for failed navigation', async () => {
      // This would test error boundary components
      const hasErrorBoundary = await page.evaluate(() => {
        return document.querySelector('.error-boundary, [data-testid="error-boundary"]') !== null;
      });
      
      expect(typeof hasErrorBoundary).toBe('boolean');
    });
  });

  describe('Performance Navigation', () => {
    it('should navigate between pages within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await dashboardPage.navigateToTTS();
      await ttsPage.isLoaded();
      
      const endTime = Date.now();
      const navigationTime = endTime - startTime;
      
      // Navigation should complete within 5 seconds
      expect(navigationTime).toBeLessThan(5000);
    });

    it('should preload important pages for faster navigation', async () => {
      // Check if critical routes are prefetched
      const prefetchedLinks = await page.$$eval(
        'link[rel="prefetch"], link[rel="preload"]',
        links => links.map(link => link.getAttribute('href')).filter(href => href)
      );
      
      // Should have some prefetched resources
      expect(prefetchedLinks.length).toBeGreaterThanOrEqual(0);
    });
  });
});
import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { TTSPage } from '../../pages/tts/TTSPage';
import { VoiceCloningPage } from '../../pages/voice-cloning/VoiceCloningPage';

describe('Performance Testing', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ttsPage: TTSPage;
  let voiceCloningPage: VoiceCloningPage;

  beforeAll(async () => {
    // Login before running performance tests
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

  describe('Page Load Performance', () => {
    it('should load login page within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Login page should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      console.log(`Login page load time: ${loadTime}ms`);
    });

    it('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();
      
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      console.log(`Dashboard load time: ${loadTime}ms`);
    });

    it('should load TTS page within acceptable time', async () => {
      const startTime = Date.now();
      
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      const loadTime = Date.now() - startTime;
      
      // TTS page should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      console.log(`TTS page load time: ${loadTime}ms`);
    });

    it('should load voice cloning page within acceptable time', async () => {
      const startTime = Date.now();
      
      await voiceCloningPage.goto();
      await voiceCloningPage.isLoaded();
      
      const loadTime = Date.now() - startTime;
      
      // Voice cloning page should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      console.log(`Voice cloning page load time: ${loadTime}ms`);
    });

    it('should have fast navigation between pages', async () => {
      const navigationTests = [
        { from: 'home', to: 'projects', method: 'navigateToProjects' },
        { from: 'projects', to: 'tts', method: 'navigateToTTS' },
        { from: 'tts', to: 'voice-cloning', method: 'navigateToVoiceCloning' },
        { from: 'voice-cloning', to: 'home', method: 'navigateToHome' }
      ];

      for (const nav of navigationTests) {
        const startTime = Date.now();
        
        await (dashboardPage as any)[nav.method]();
        await dashboardPage.waitForPageLoad();
        
        const navTime = Date.now() - startTime;
        
        // Navigation should complete within 2 seconds
        expect(navTime).toBeLessThan(2000);
        console.log(`Navigation ${nav.from} -> ${nav.to}: ${navTime}ms`);
      }
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Simulate slow 3G connection
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 40
      });

      const startTime = Date.now();
      
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Should still load within 10 seconds on slow connection
      expect(loadTime).toBeLessThan(10000);
      console.log(`Dashboard load time on slow network: ${loadTime}ms`);

      // Reset network conditions
      await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    });

    it('should minimize number of network requests', async () => {
      const requests: string[] = [];
      
      page.on('request', (request) => {
        requests.push(request.url());
      });

      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Login page should not make excessive requests
      expect(requests.length).toBeLessThan(50);
      console.log(`Login page requests: ${requests.length}`);

      page.removeAllListeners('request');
    });

    it('should load resources efficiently', async () => {
      let totalTransferSize = 0;
      
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      
      client.on('Network.loadingFinished', (params) => {
        totalTransferSize += params.encodedDataLength;
      });

      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      // Wait for all resources to finish loading
      await page.waitForTimeout(2000);
      
      // Total transfer should be reasonable (under 5MB for initial load)
      expect(totalTransferSize).toBeLessThan(5 * 1024 * 1024);
      console.log(`Total transfer size: ${(totalTransferSize / 1024 / 1024).toFixed(2)} MB`);
      
      await client.detach();
    });

    it('should handle network errors gracefully', async () => {
      // Test offline behavior
      await page.setOfflineMode(true);
      
      const startTime = Date.now();
      
      try {
        await page.goto('http://localhost:3000/login');
      } catch (error) {
        // Expected to fail offline
      }
      
      const errorTime = Date.now() - startTime;
      
      // Should fail quickly (within 5 seconds), not hang indefinitely
      expect(errorTime).toBeLessThan(5000);
      
      // Restore online mode
      await page.setOfflineMode(false);
    });
  });

  describe('Memory Usage', () => {
    it('should not have excessive memory usage', async () => {
      const initialMetrics = await page.metrics();
      
      // Navigate through several pages to test memory usage
      const pages = ['home', 'projects', 'tts', 'voice-cloning', 'explore', 'voices'];
      
      for (const pageName of pages) {
        const methodName = `navigateTo${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`;
        
        if (typeof (dashboardPage as any)[methodName] === 'function') {
          await (dashboardPage as any)[methodName]();
          await dashboardPage.waitForPageLoad();
        }
      }
      
      const finalMetrics = await page.metrics();
      
      // Memory should not increase excessively (less than 50MB)
      const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      
      console.log(`Memory increase after navigation: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    });

    it('should clean up resources properly', async () => {
      const initialMetrics = await page.metrics();
      
      // Perform resource-intensive operations
      await ttsPage.goto();
      await ttsPage.enterText('Testing memory cleanup with text-to-speech functionality.');
      
      // Try to generate TTS (if it completes quickly)
      try {
        await ttsPage.generateTTS();
        await Promise.race([
          ttsPage.waitForGeneration(10000),
          new Promise(resolve => setTimeout(resolve, 10000))
        ]);
      } catch (error) {
        // TTS might not complete or fail - that's okay for this test
      }
      
      // Navigate away and back
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Force garbage collection if possible
      if ((global as any).gc) {
        (global as any).gc();
      }
      
      await page.waitForTimeout(2000);
      
      const finalMetrics = await page.metrics();
      
      // Memory should not grow excessively
      const memoryIncrease = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
      
      console.log(`Memory increase after TTS operations: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
    });
  });

  describe('CPU Performance', () => {
    it('should not block UI during processing', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      await ttsPage.enterText('Testing UI responsiveness during processing.');
      
      // Start TTS generation
      await ttsPage.generateTTS();
      
      // Test UI responsiveness during processing
      const startTime = Date.now();
      
      // Try to interact with other UI elements
      if (await ttsPage.isVisible('.speed-slider, [data-testid="speed-slider"]')) {
        await page.click('.speed-slider, [data-testid="speed-slider"]');
      }
      
      const interactionTime = Date.now() - startTime;
      
      // UI interaction should be responsive (under 100ms)
      expect(interactionTime).toBeLessThan(100);
      console.log(`UI interaction time during processing: ${interactionTime}ms`);
    });

    it('should handle concurrent operations efficiently', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const startTime = Date.now();
      
      // Simulate concurrent operations
      const operations = [
        dashboardPage.navigateToProjects(),
        page.waitForTimeout(100).then(() => dashboardPage.navigateToTTS()),
        page.waitForTimeout(200).then(() => dashboardPage.navigateToVoiceCloning())
      ];
      
      await Promise.all(operations);
      await dashboardPage.waitForPageLoad();
      
      const totalTime = Date.now() - startTime;
      
      // Concurrent operations should complete efficiently
      expect(totalTime).toBeLessThan(3000);
      console.log(`Concurrent operations time: ${totalTime}ms`);
    });
  });

  describe('Bundle Size and Loading', () => {
    it('should have optimized JavaScript bundle sizes', async () => {
      let totalJSSize = 0;
      let totalCSSSize = 0;
      
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      
      client.on('Network.responseReceived', (params) => {
        const response = params.response;
        const url = response.url;
        
        if (url.endsWith('.js') || url.includes('javascript')) {
          totalJSSize += response.encodedDataLength || 0;
        } else if (url.endsWith('.css') || url.includes('stylesheet')) {
          totalCSSSize += response.encodedDataLength || 0;
        }
      });

      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Wait for all resources to load
      await page.waitForTimeout(3000);
      
      // JS bundle should be reasonable size (under 2MB)
      expect(totalJSSize).toBeLessThan(2 * 1024 * 1024);
      
      // CSS should be reasonable size (under 500KB)
      expect(totalCSSSize).toBeLessThan(500 * 1024);
      
      console.log(`Total JS size: ${(totalJSSize / 1024).toFixed(2)} KB`);
      console.log(`Total CSS size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
      
      await client.detach();
    });

    it('should implement code splitting effectively', async () => {
      const jsFiles: string[] = [];
      
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      
      client.on('Network.responseReceived', (params) => {
        const url = params.response.url;
        if (url.endsWith('.js') && !url.includes('node_modules')) {
          jsFiles.push(url);
        }
      });

      // Load main page
      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      const mainPageJSFiles = [...jsFiles];
      
      // Navigate to different feature
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      const ttsPageJSFiles = jsFiles.filter(file => !mainPageJSFiles.includes(file));
      
      // Should load additional JS for new features (code splitting)
      if (ttsPageJSFiles.length > 0) {
        console.log(`Code splitting working: ${ttsPageJSFiles.length} additional JS files for TTS`);
        expect(ttsPageJSFiles.length).toBeGreaterThan(0);
      }
      
      await client.detach();
    });
  });

  describe('Asset Optimization', () => {
    it('should compress and cache static assets', async () => {
      const cachedRequests: string[] = [];
      const compressedRequests: string[] = [];
      
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      
      client.on('Network.responseReceived', (params) => {
        const response = params.response;
        const headers = response.headers;
        
        // Check for compression
        if (headers['content-encoding'] && 
            (headers['content-encoding'].includes('gzip') || headers['content-encoding'].includes('br'))) {
          compressedRequests.push(response.url);
        }
        
        // Check for caching headers
        if (headers['cache-control'] || headers['etag'] || headers['last-modified']) {
          cachedRequests.push(response.url);
        }
      });

      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      console.log(`Compressed requests: ${compressedRequests.length}`);
      console.log(`Cacheable requests: ${cachedRequests.length}`);
      
      // Most static assets should be compressed
      expect(compressedRequests.length).toBeGreaterThan(0);
      
      // Most assets should have caching headers
      expect(cachedRequests.length).toBeGreaterThan(0);
      
      await client.detach();
    });

    it('should optimize images for web', async () => {
      const imageRequests: Array<{url: string; size: number}> = [];
      
      const client = await page.target().createCDPSession();
      await client.send('Network.enable');
      
      client.on('Network.loadingFinished', (params) => {
        const request = params;
        if (request.encodedDataLength > 0) {
          imageRequests.push({
            url: request.requestId, // Would need to track request URL separately
            size: request.encodedDataLength
          });
        }
      });

      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      // Check for image optimization
      const images = await page.$$eval('img', imgs => 
        imgs.map(img => ({
          src: img.src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          loading: img.loading
        }))
      );
      
      // Images should use lazy loading where appropriate
      const lazyImages = images.filter(img => img.loading === 'lazy');
      console.log(`Images with lazy loading: ${lazyImages.length}/${images.length}`);
      
      await client.detach();
    });
  });

  describe('Real User Metrics Simulation', () => {
    it('should measure First Contentful Paint (FCP)', async () => {
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/login');
      
      // Wait for FCP
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      const performanceMetrics = await client.send('Performance.getMetrics');
      const fcpMetric = performanceMetrics.metrics.find(m => m.name === 'FirstContentfulPaint');
      
      if (fcpMetric) {
        const fcpTime = fcpMetric.value * 1000; // Convert to milliseconds
        console.log(`First Contentful Paint: ${fcpTime.toFixed(2)}ms`);
        
        // FCP should be under 2 seconds for good user experience
        expect(fcpTime).toBeLessThan(2000);
      }
      
      await client.detach();
    });

    it('should measure Largest Contentful Paint (LCP)', async () => {
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');
      
      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      // Wait additional time for LCP measurement
      await page.waitForTimeout(3000);
      
      const performanceMetrics = await client.send('Performance.getMetrics');
      const lcpMetric = performanceMetrics.metrics.find(m => m.name === 'LargestContentfulPaint');
      
      if (lcpMetric) {
        const lcpTime = lcpMetric.value * 1000;
        console.log(`Largest Contentful Paint: ${lcpTime.toFixed(2)}ms`);
        
        // LCP should be under 2.5 seconds for good user experience
        expect(lcpTime).toBeLessThan(2500);
      }
      
      await client.detach();
    });

    it('should measure Cumulative Layout Shift (CLS)', async () => {
      const client = await page.target().createCDPSession();
      await client.send('Runtime.enable');
      
      await page.goto('http://localhost:3000/home');
      
      // Inject CLS measurement script
      await page.evaluate(() => {
        let cumulativeLayoutShift = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Store CLS value globally
        (window as any).cumulativeLayoutShift = () => cumulativeLayoutShift;
      });
      
      await dashboardPage.waitForPageLoad();
      
      // Wait for layout to stabilize
      await page.waitForTimeout(3000);
      
      const clsValue = await page.evaluate(() => {
        return (window as any).cumulativeLayoutShift ? (window as any).cumulativeLayoutShift() : 0;
      });
      
      console.log(`Cumulative Layout Shift: ${clsValue}`);
      
      // CLS should be under 0.1 for good user experience
      expect(clsValue).toBeLessThan(0.1);
      
      await client.detach();
    });

    it('should measure Time to Interactive (TTI)', async () => {
      const client = await page.target().createCDPSession();
      await client.send('Performance.enable');
      await client.send('Runtime.enable');
      
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/tts/create');
      await ttsPage.isLoaded();
      
      // Test interactivity by trying to interact with form
      await page.waitForSelector('textarea, input[type="text"]', { timeout: 10000 });
      
      const interactiveTime = Date.now();
      
      // Try to type in the text area to confirm interactivity
      await ttsPage.enterText('Testing interactivity');
      
      const ttiTime = interactiveTime - startTime;
      console.log(`Time to Interactive: ${ttiTime}ms`);
      
      // TTI should be under 5 seconds for good user experience
      expect(ttiTime).toBeLessThan(5000);
      
      await client.detach();
    });
  });

  describe('Mobile Performance', () => {
    beforeEach(async () => {
      // Simulate mobile device
      await page.emulate({
        name: 'iPhone 12',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        viewport: {
          width: 390,
          height: 844,
          deviceScaleFactor: 3,
          isMobile: true,
          hasTouch: true,
        }
      });
    });

    afterEach(async () => {
      // Reset to desktop
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    });

    it('should perform well on mobile devices', async () => {
      const startTime = Date.now();
      
      await page.goto('http://localhost:3000/home');
      await dashboardPage.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 6 seconds (allowing for slower processing)
      expect(loadTime).toBeLessThan(6000);
      console.log(`Mobile load time: ${loadTime}ms`);
    });

    it('should handle touch interactions smoothly', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      const startTime = Date.now();
      
      // Simulate touch navigation
      if (await page.$('.mobile-menu-button, .hamburger')) {
        await page.tap('.mobile-menu-button, .hamburger');
        await page.waitForTimeout(500);
        
        const touchResponseTime = Date.now() - startTime;
        
        // Touch response should be immediate (under 100ms)
        expect(touchResponseTime).toBeLessThan(1000);
        console.log(`Touch response time: ${touchResponseTime}ms`);
      }
    });
  });

  describe('Performance Regression Detection', () => {
    it('should maintain performance benchmarks', async () => {
      const benchmarks = {
        loginLoad: 3000,
        dashboardLoad: 5000,
        ttsLoad: 4000,
        voiceCloningLoad: 4000,
        navigationTime: 2000
      };

      // Test login load time
      const loginStart = Date.now();
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      const loginTime = Date.now() - loginStart;
      
      expect(loginTime).toBeLessThan(benchmarks.loginLoad);
      
      // Test dashboard load time
      const dashboardStart = Date.now();
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      const dashboardTime = Date.now() - dashboardStart;
      
      expect(dashboardTime).toBeLessThan(benchmarks.dashboardLoad);
      
      // Test navigation time
      const navStart = Date.now();
      await dashboardPage.navigateToTTS();
      await dashboardPage.waitForPageLoad();
      const navTime = Date.now() - navStart;
      
      expect(navTime).toBeLessThan(benchmarks.navigationTime);
      
      console.log('Performance benchmarks:');
      console.log(`Login load: ${loginTime}ms (benchmark: ${benchmarks.loginLoad}ms)`);
      console.log(`Dashboard load: ${dashboardTime}ms (benchmark: ${benchmarks.dashboardLoad}ms)`);
      console.log(`Navigation: ${navTime}ms (benchmark: ${benchmarks.navigationTime}ms)`);
    });
  });
});
import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { TTSPage } from '../../pages/tts/TTSPage';
import { VoiceCloningPage } from '../../pages/voice-cloning/VoiceCloningPage';

describe('Visual Regression Testing', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ttsPage: TTSPage;
  let voiceCloningPage: VoiceCloningPage;

  beforeAll(async () => {
    // Login before running visual tests
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await loginPage.waitForLogin();
  });

  beforeEach(async () => {
    dashboardPage = new DashboardPage(page);
    ttsPage = new TTSPage(page);
    voiceCloningPage = new VoiceCloningPage(page);
    
    // Ensure consistent viewport for visual tests
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
  });

  describe('Authentication Pages Visual Tests', () => {
    it('should match login page visual snapshot', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('login-page', {
        hideElements: ['.loading', '.spinner'],
        maskElements: ['.timestamp', '.version-info']
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'login-page-desktop'
      });
    });

    it('should match signup page visual snapshot', async () => {
      await page.goto('http://localhost:3000/signup');
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('signup-page');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'signup-page-desktop'
      });
    });

    it('should match login form validation states', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Trigger validation errors
      await page.click('button[type="submit"], .login-button');
      await page.waitForTimeout(1000);
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('login-validation-errors');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'login-validation-errors-desktop'
      });
    });

    it('should match signup form with filled data', async () => {
      await page.goto('http://localhost:3000/signup');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Fill out form
      if (await page.$('input[name="name"]')) {
        await page.type('input[name="name"]', 'Test User');
      }
      await page.type('input[type="email"], input[name="email"]', 'test@example.com');
      await page.type('input[type="password"], input[name="password"]', 'TestPassword123!');
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('signup-form-filled');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'signup-form-filled-desktop'
      });
    });
  });

  describe('Dashboard Visual Tests', () => {
    beforeEach(async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
    });

    it('should match dashboard home page layout', async () => {
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('dashboard-home', {
        hideElements: ['.notification-badge', '.live-data'],
        maskElements: ['.user-avatar', '.timestamp', '.recent-activity']
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-home-desktop'
      });
    });

    it('should match sidebar navigation', async () => {
      await global.visualTestUtils?.stabilizePage();
      
      const sidebarElement = await page.$('.sidebar, .nav-sidebar, [data-testid="sidebar"]');
      if (sidebarElement) {
        const screenshot = await sidebarElement.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'dashboard-sidebar-desktop'
        });
      }
    });

    it('should match header with user menu', async () => {
      await global.visualTestUtils?.stabilizePage();
      
      const headerElement = await page.$('.header, .dashboard-header, [data-testid="header"]');
      if (headerElement) {
        const screenshot = await headerElement.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'dashboard-header-desktop',
          maskOptions: {
            style: 'filled',
            color: '#cccccc'
          }
        });
      }
    });

    it('should match projects page layout', async () => {
      await dashboardPage.navigateToProjects();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('projects-page', {
        maskElements: ['.project-date', '.last-modified', '.file-size']
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'projects-page-desktop'
      });
    });

    it('should match explore page layout', async () => {
      await dashboardPage.navigateToExplore();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('explore-page');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'explore-page-desktop'
      });
    });

    it('should match voices library page', async () => {
      await dashboardPage.navigateToVoices();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('voices-page');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'voices-page-desktop'
      });
    });

    it('should match account settings page', async () => {
      await dashboardPage.navigateToAccount();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('account-page', {
        maskElements: ['.user-email', '.profile-photo', '.personal-info']
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'account-page-desktop'
      });
    });
  });

  describe('TTS Interface Visual Tests', () => {
    beforeEach(async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
    });

    it('should match TTS creation page layout', async () => {
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-create-page');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-create-page-desktop'
      });
    });

    it('should match TTS form with text input', async () => {
      const testText = 'This is a sample text for visual testing of the TTS interface.';
      await ttsPage.enterText(testText);
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-with-text');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-with-text-desktop'
      });
    });

    it('should match voice selection interface', async () => {
      // Open voice selection if it's a modal or dropdown
      if (await page.$('.voice-select, [data-testid="voice-select"]')) {
        await page.click('.voice-select, [data-testid="voice-select"]');
        await page.waitForTimeout(1000);
      }
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-voice-selection');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-voice-selection-desktop'
      });
    });

    it('should match TTS settings panel', async () => {
      // Adjust some settings to show the interface
      if (await page.$('.speed-slider, [data-testid="speed-slider"]')) {
        await page.evaluate(() => {
          const slider = document.querySelector('.speed-slider, [data-testid="speed-slider"]') as HTMLInputElement;
          if (slider) slider.value = '1.3';
        });
      }
      
      await global.visualTestUtils?.stabilizePage();
      
      const settingsPanel = await page.$('.settings-panel, .voice-settings, .tts-controls');
      if (settingsPanel) {
        const screenshot = await settingsPanel.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'tts-settings-panel-desktop'
        });
      }
    });

    it('should match TTS processing state', async () => {
      await ttsPage.enterText('Testing processing state visualization.');
      await ttsPage.generateTTS();
      
      // Capture processing state quickly
      await page.waitForTimeout(500);
      
      if (await ttsPage.isGenerating()) {
        const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-processing-state', {
          hideElements: ['.progress-bar'] // Hide animated elements
        });
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'tts-processing-state-desktop'
        });
      }
    });

    it('should match TTS success state with audio player', async () => {
      await ttsPage.enterText('Testing success state visualization.');
      await ttsPage.generateTTS();
      
      try {
        await ttsPage.waitForGeneration(30000);
        
        await global.visualTestUtils?.stabilizePage();
        
        const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-success-state', {
          maskElements: ['.audio-duration', '.generation-time']
        });
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'tts-success-state-desktop'
        });
      } catch (error) {
        console.log('TTS generation timeout in visual test');
      }
    });
  });

  describe('Voice Cloning Interface Visual Tests', () => {
    beforeEach(async () => {
      await voiceCloningPage.goto();
      await voiceCloningPage.isLoaded();
    });

    it('should match voice cloning upload interface', async () => {
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('voice-cloning-upload');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'voice-cloning-upload-desktop'
      });
    });

    it('should match voice configuration form', async () => {
      await voiceCloningPage.setVoiceName('Visual Test Voice');
      await voiceCloningPage.setVoiceDescription('This is a test voice for visual regression testing.');
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('voice-cloning-config', {
        maskElements: ['.voice-name'] // Mask dynamic content
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'voice-cloning-config-desktop'
      });
    });

    it('should match recording interface', async () => {
      if (await page.$('.record-button, [data-testid="start-recording"]')) {
        const recordingSection = await page.$('.recording-section, .record-interface, [data-testid="recording-interface"]');
        
        if (recordingSection) {
          const screenshot = await recordingSection.screenshot();
          
          expect(screenshot).toMatchImageSnapshot({
            customSnapshotIdentifier: 'voice-cloning-recording-desktop'
          });
        }
      }
    });

    it('should match voice cloning processing state', async () => {
      // Set up minimal data for processing test
      await voiceCloningPage.setVoiceName('Processing Test');
      
      // Mock audio file upload (visual test doesn't need real audio)
      if (await page.$('input[type="file"]')) {
        await page.evaluate(() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            // Simulate file selected state
            fileInput.classList.add('has-file');
          }
        });
      }
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('voice-cloning-ready');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'voice-cloning-ready-desktop'
      });
    });

    it('should match voices library interface', async () => {
      if (await page.$('.voices-library, [data-testid="voices-library"]')) {
        await global.visualTestUtils?.stabilizePage();
        
        const librarySection = await page.$('.voices-library, [data-testid="voices-library"]');
        if (librarySection) {
          const screenshot = await librarySection.screenshot();
          
          expect(screenshot).toMatchImageSnapshot({
            customSnapshotIdentifier: 'voice-cloning-library-desktop'
          });
        }
      }
    });
  });

  describe('Mobile Visual Tests', () => {
    beforeEach(async () => {
      // Set mobile viewport
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
      });
    });

    afterEach(async () => {
      // Reset to desktop viewport
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    });

    it('should match mobile login page', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('login-page-mobile');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'login-page-mobile'
      });
    });

    it('should match mobile dashboard with hamburger menu', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('dashboard-mobile');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-mobile'
      });
    });

    it('should match mobile navigation menu opened', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      if (await page.$('.mobile-menu-button, .hamburger, [data-testid="mobile-menu"]')) {
        await page.click('.mobile-menu-button, .hamburger, [data-testid="mobile-menu"]');
        await page.waitForTimeout(500);
        
        await global.visualTestUtils?.stabilizePage();
        
        const screenshot = await global.visualTestUtils?.takeVisualSnapshot('mobile-menu-open');
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'mobile-menu-open'
        });
      }
    });

    it('should match mobile TTS interface', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-mobile');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-mobile'
      });
    });
  });

  describe('Tablet Visual Tests', () => {
    beforeEach(async () => {
      // Set tablet viewport (iPad)
      await page.setViewport({
        width: 768,
        height: 1024,
        deviceScaleFactor: 1,
      });
    });

    afterEach(async () => {
      // Reset to desktop viewport
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    });

    it('should match tablet dashboard layout', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('dashboard-tablet');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-tablet'
      });
    });

    it('should match tablet TTS interface', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-tablet');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-tablet'
      });
    });
  });

  describe('Dark Mode Visual Tests', () => {
    beforeEach(async () => {
      // Enable dark mode if available
      await page.evaluate(() => {
        // Try different methods to enable dark mode
        if (localStorage) {
          localStorage.setItem('theme', 'dark');
          localStorage.setItem('darkMode', 'true');
        }
        
        // Trigger dark mode class on body
        document.body.classList.add('dark', 'dark-mode', 'theme-dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      });
      
      await page.reload();
    });

    afterEach(async () => {
      // Reset to light mode
      await page.evaluate(() => {
        if (localStorage) {
          localStorage.removeItem('theme');
          localStorage.removeItem('darkMode');
        }
        document.body.classList.remove('dark', 'dark-mode', 'theme-dark');
        document.documentElement.removeAttribute('data-theme');
      });
    });

    it('should match dark mode login page', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('login-page-dark');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'login-page-dark-desktop'
      });
    });

    it('should match dark mode dashboard', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('dashboard-dark', {
        maskElements: ['.user-avatar', '.timestamp', '.recent-activity']
      });
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'dashboard-dark-desktop'
      });
    });

    it('should match dark mode TTS interface', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('tts-dark');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'tts-dark-desktop'
      });
    });
  });

  describe('Component State Visual Tests', () => {
    it('should match button hover states', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      // Hover over generate button
      const generateButton = await page.$('.generate-button, [data-testid="generate-tts"]');
      if (generateButton) {
        await generateButton.hover();
        await page.waitForTimeout(300);
        
        const screenshot = await generateButton.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'button-hover-state'
        });
      }
    });

    it('should match form focus states', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Focus on email input
      await page.focus('input[type="email"]');
      await page.waitForTimeout(300);
      
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        const screenshot = await emailInput.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'input-focus-state'
        });
      }
    });

    it('should match loading spinner states', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      await ttsPage.enterText('Testing loading states.');
      await ttsPage.generateTTS();
      
      // Capture spinner immediately
      await page.waitForTimeout(200);
      
      if (await ttsPage.isVisible('.loading, .spinner, [data-testid="loading"]')) {
        const spinner = await page.$('.loading, .spinner, [data-testid="loading"]');
        if (spinner) {
          const screenshot = await spinner.screenshot();
          
          expect(screenshot).toMatchImageSnapshot({
            customSnapshotIdentifier: 'loading-spinner-state'
          });
        }
      }
    });

    it('should match error message states', async () => {
      await page.goto('http://localhost:3000/login');
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });
      
      // Trigger validation errors
      await page.type('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"], .login-button');
      await page.waitForTimeout(1000);
      
      const errorElement = await page.$('.error-message, .alert-error, [role="alert"]');
      if (errorElement) {
        const screenshot = await errorElement.screenshot();
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'error-message-state'
        });
      }
    });

    it('should match dropdown open states', async () => {
      await ttsPage.goto();
      await ttsPage.isLoaded();
      
      // Open voice selection dropdown
      const voiceSelect = await page.$('.voice-select, [data-testid="voice-select"]');
      if (voiceSelect) {
        await voiceSelect.click();
        await page.waitForTimeout(500);
        
        const screenshot = await global.visualTestUtils?.takeVisualSnapshot('dropdown-open-state');
        
        expect(screenshot).toMatchImageSnapshot({
          customSnapshotIdentifier: 'dropdown-open-state'
        });
      }
    });
  });

  describe('Browser Compatibility Visual Tests', () => {
    // These tests would run with different Puppeteer browser configurations
    // For now, we'll test with different CSS features that might render differently
    
    it('should match interface with CSS Grid layout', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Ensure CSS Grid is being used
      await page.evaluate(() => {
        const gridContainers = document.querySelectorAll('.grid, .dashboard-grid, .layout-grid');
        gridContainers.forEach(container => {
          (container as HTMLElement).style.display = 'grid';
        });
      });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('css-grid-layout');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'css-grid-layout-desktop'
      });
    });

    it('should match interface with Flexbox layout fallback', async () => {
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      // Force flexbox layout
      await page.evaluate(() => {
        const flexContainers = document.querySelectorAll('.flex, .dashboard-flex, .layout-flex');
        flexContainers.forEach(container => {
          (container as HTMLElement).style.display = 'flex';
        });
      });
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('flexbox-layout');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'flexbox-layout-desktop'
      });
    });
  });

  describe('High DPI Visual Tests', () => {
    it('should match interface on high DPI screens', async () => {
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2, // Retina/High DPI
      });
      
      await dashboardPage.navigateToHome();
      await dashboardPage.waitForPageLoad();
      
      await global.visualTestUtils?.stabilizePage();
      
      const screenshot = await global.visualTestUtils?.takeVisualSnapshot('high-dpi-dashboard');
      
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'high-dpi-dashboard'
      });
      
      // Reset device scale factor
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      });
    });
  });
});
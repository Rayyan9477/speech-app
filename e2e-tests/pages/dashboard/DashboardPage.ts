import { Page } from 'puppeteer';
import { BasePage } from '../BasePage';

export class DashboardPage extends BasePage {
  private selectors = {
    // Navigation
    sidebarNav: '.sidebar, .nav-sidebar, [data-testid="sidebar"]',
    homeLink: 'a[href*="/home"], .nav-home, [data-testid="nav-home"]',
    projectsLink: 'a[href*="/projects"], .nav-projects, [data-testid="nav-projects"]',
    exploreLink: 'a[href*="/explore"], .nav-explore, [data-testid="nav-explore"]',
    voicesLink: 'a[href*="/voices"], .nav-voices, [data-testid="nav-voices"]',
    ttsLink: 'a[href*="/tts"], .nav-tts, [data-testid="nav-tts"]',
    voiceCloningLink: 'a[href*="/voice-cloning"], .nav-voice-cloning, [data-testid="nav-voice-cloning"]',
    voiceTranslateLink: 'a[href*="/voice-translate"], .nav-voice-translate, [data-testid="nav-voice-translate"]',
    accountLink: 'a[href*="/account"], .nav-account, [data-testid="nav-account"]',
    
    // Header
    header: '.header, .dashboard-header, [data-testid="header"]',
    userMenu: '.user-menu, .profile-menu, [data-testid="user-menu"]',
    userAvatar: '.user-avatar, .profile-avatar, [data-testid="user-avatar"]',
    logoutButton: '.logout-button, [data-testid="logout"]',
    settingsButton: '.settings-button, [data-testid="settings"]',
    
    // Main content
    mainContent: '.main-content, .dashboard-content, [data-testid="main-content"]',
    pageTitle: 'h1, .page-title, [data-testid="page-title"]',
    breadcrumb: '.breadcrumb, [data-testid="breadcrumb"]',
    
    // Loading states
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    pageLoader: '.page-loader, [data-testid="page-loader"]',
    
    // Notifications
    notificationBell: '.notification-bell, [data-testid="notifications"]',
    notificationBadge: '.notification-badge, [data-testid="notification-badge"]',
    notificationDropdown: '.notification-dropdown, [data-testid="notification-dropdown"]',
    
    // Mobile responsive elements
    mobileMenuButton: '.mobile-menu-button, .hamburger, [data-testid="mobile-menu"]',
    mobileSidebar: '.mobile-sidebar, [data-testid="mobile-sidebar"]',
    
    // Quick actions (if present on dashboard)
    quickActions: '.quick-actions, [data-testid="quick-actions"]',
    createProjectButton: '.create-project-btn, [data-testid="create-project"]',
    uploadAudioButton: '.upload-audio-btn, [data-testid="upload-audio"]',
    
    // Stats/metrics (if present)
    statsContainer: '.stats-container, .metrics, [data-testid="stats"]',
    projectCount: '.project-count, [data-testid="project-count"]',
    processingStatus: '.processing-status, [data-testid="processing-status"]'
  };

  constructor(page: Page) {
    super(page, '/home'); // Default to home page
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector(this.selectors.sidebarNav, 10000);
      await this.waitForSelector(this.selectors.header, 10000);
      await this.waitForSelector(this.selectors.mainContent, 10000);
      return true;
    } catch {
      return false;
    }
  }

  // Navigation methods
  async navigateToHome(): Promise<void> {
    await this.click(this.selectors.homeLink);
    await this.waitForUrl('/home');
  }

  async navigateToProjects(): Promise<void> {
    await this.click(this.selectors.projectsLink);
    await this.waitForUrl('/projects');
  }

  async navigateToExplore(): Promise<void> {
    await this.click(this.selectors.exploreLink);
    await this.waitForUrl('/explore');
  }

  async navigateToVoices(): Promise<void> {
    await this.click(this.selectors.voicesLink);
    await this.waitForUrl('/voices');
  }

  async navigateToTTS(): Promise<void> {
    await this.click(this.selectors.ttsLink);
    await this.waitForUrl('/tts');
  }

  async navigateToVoiceCloning(): Promise<void> {
    await this.click(this.selectors.voiceCloningLink);
    await this.waitForUrl('/voice-cloning');
  }

  async navigateToVoiceTranslate(): Promise<void> {
    await this.click(this.selectors.voiceTranslateLink);
    await this.waitForUrl('/voice-translate');
  }

  async navigateToAccount(): Promise<void> {
    await this.click(this.selectors.accountLink);
    await this.waitForUrl('/account');
  }

  // User menu interactions
  async openUserMenu(): Promise<void> {
    if (await this.isVisible(this.selectors.userMenu)) {
      await this.click(this.selectors.userMenu);
    } else if (await this.isVisible(this.selectors.userAvatar)) {
      await this.click(this.selectors.userAvatar);
    }
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.click(this.selectors.logoutButton);
  }

  async openSettings(): Promise<void> {
    await this.openUserMenu();
    if (await this.isVisible(this.selectors.settingsButton)) {
      await this.click(this.selectors.settingsButton);
    }
  }

  // Mobile navigation
  async openMobileMenu(): Promise<void> {
    if (await this.isVisible(this.selectors.mobileMenuButton)) {
      await this.click(this.selectors.mobileMenuButton);
      await this.waitForElement(this.selectors.mobileSidebar, 'visible');
    }
  }

  async closeMobileMenu(): Promise<void> {
    if (await this.isVisible(this.selectors.mobileMenuButton)) {
      await this.click(this.selectors.mobileMenuButton);
      await this.waitForElement(this.selectors.mobileSidebar, 'hidden');
    }
  }

  // Notifications
  async openNotifications(): Promise<void> {
    if (await this.isVisible(this.selectors.notificationBell)) {
      await this.click(this.selectors.notificationBell);
      await this.waitForElement(this.selectors.notificationDropdown, 'visible');
    }
  }

  async getNotificationCount(): Promise<number> {
    if (await this.isVisible(this.selectors.notificationBadge)) {
      const countText = await this.getText(this.selectors.notificationBadge);
      return parseInt(countText) || 0;
    }
    return 0;
  }

  async hasUnreadNotifications(): Promise<boolean> {
    return (await this.getNotificationCount()) > 0;
  }

  // Quick actions
  async clickCreateProject(): Promise<void> {
    if (await this.isVisible(this.selectors.createProjectButton)) {
      await this.click(this.selectors.createProjectButton);
    }
  }

  async clickUploadAudio(): Promise<void> {
    if (await this.isVisible(this.selectors.uploadAudioButton)) {
      await this.click(this.selectors.uploadAudioButton);
    }
  }

  // Content getters
  async getPageTitle(): Promise<string> {
    if (await this.isVisible(this.selectors.pageTitle)) {
      return await this.getText(this.selectors.pageTitle);
    }
    return '';
  }

  async getCurrentSection(): Promise<string> {
    const url = await this.getCurrentUrl();
    
    if (url.includes('/home')) return 'home';
    if (url.includes('/projects')) return 'projects';
    if (url.includes('/explore')) return 'explore';
    if (url.includes('/voices')) return 'voices';
    if (url.includes('/tts')) return 'tts';
    if (url.includes('/voice-cloning')) return 'voice-cloning';
    if (url.includes('/voice-translate')) return 'voice-translate';
    if (url.includes('/account')) return 'account';
    
    return 'unknown';
  }

  async getBreadcrumb(): Promise<string[]> {
    if (await this.isVisible(this.selectors.breadcrumb)) {
      const breadcrumbText = await this.getText(this.selectors.breadcrumb);
      return breadcrumbText.split('/').map(item => item.trim()).filter(item => item);
    }
    return [];
  }

  // Stats and metrics
  async getProjectCount(): Promise<number> {
    if (await this.isVisible(this.selectors.projectCount)) {
      const countText = await this.getText(this.selectors.projectCount);
      const match = countText.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }
    return 0;
  }

  async getProcessingStatus(): Promise<string> {
    if (await this.isVisible(this.selectors.processingStatus)) {
      return await this.getText(this.selectors.processingStatus);
    }
    return '';
  }

  // Loading states
  async isPageLoading(): Promise<boolean> {
    return await this.isVisible(this.selectors.loadingSpinner) || 
           await this.isVisible(this.selectors.pageLoader);
  }

  async waitForPageLoad(): Promise<void> {
    // Wait for main content to be visible
    await this.waitForElement(this.selectors.mainContent, 'visible');
    
    // Wait for any loading spinners to disappear
    if (await this.isVisible(this.selectors.loadingSpinner)) {
      await this.waitForElement(this.selectors.loadingSpinner, 'hidden', 30000);
    }
    
    if (await this.isVisible(this.selectors.pageLoader)) {
      await this.waitForElement(this.selectors.pageLoader, 'hidden', 30000);
    }
    
    // Wait for network idle
    await this.waitForNetworkIdle();
  }

  // Verification methods
  async isNavigationVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.sidebarNav);
  }

  async isUserAuthenticated(): Promise<boolean> {
    // Check if we're on a dashboard page and user menu is present
    const url = await this.getCurrentUrl();
    const hasUserMenu = await this.isVisible(this.selectors.userMenu) || 
                       await this.isVisible(this.selectors.userAvatar);
    
    return url.includes('/dashboard') || url.includes('/home') || url.includes('/projects') && hasUserMenu;
  }

  async verifyDashboardLayout(): Promise<{
    hasSidebar: boolean;
    hasHeader: boolean;
    hasMainContent: boolean;
    isResponsive: boolean;
  }> {
    const hasSidebar = await this.isVisible(this.selectors.sidebarNav);
    const hasHeader = await this.isVisible(this.selectors.header);
    const hasMainContent = await this.isVisible(this.selectors.mainContent);
    
    // Check responsive design by looking for mobile menu button
    const isResponsive = await this.isVisible(this.selectors.mobileMenuButton);
    
    return {
      hasSidebar,
      hasHeader,
      hasMainContent,
      isResponsive
    };
  }

  // Utility methods
  async takeFullDashboardScreenshot(name: string = 'dashboard'): Promise<string> {
    await this.waitForPageLoad();
    return await this.takeScreenshot(`${name}-${await this.getCurrentSection()}`);
  }

  async checkAllNavigationLinks(): Promise<{ [key: string]: boolean }> {
    const links = {
      home: this.selectors.homeLink,
      projects: this.selectors.projectsLink,
      explore: this.selectors.exploreLink,
      voices: this.selectors.voicesLink,
      tts: this.selectors.ttsLink,
      voiceCloning: this.selectors.voiceCloningLink,
      voiceTranslate: this.selectors.voiceTranslateLink,
      account: this.selectors.accountLink
    };

    const results: { [key: string]: boolean } = {};
    
    for (const [name, selector] of Object.entries(links)) {
      results[name] = await this.isVisible(selector);
    }
    
    return results;
  }
}
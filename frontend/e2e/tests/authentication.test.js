/**
 * Authentication E2E Tests
 * Tests user registration, login, and session management
 */

describe('Authentication Flow', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  afterAll(async () => {
    await page.close();
  });

  describe('User Registration', () => {
    test('should register new user successfully', async () => {
      await page.goto('http://localhost:3000/signup');
      
      // Fill registration form
      await page.fill('input[name="email"]', 'newuser@example.com');
      await page.fill('input[name="password"]', 'SecurePass123');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to onboarding
      await page.waitForURL('**/onboarding/**');
      
      // Take screenshot for visual regression
      await testUtils.takeScreenshot(page, 'registration-success');
    });

    test('should validate password requirements', async () => {
      await page.goto('http://localhost:3000/signup');
      
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', '123'); // Weak password
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await page.waitForSelector('[data-testid="password-error"]');
      const errorText = await page.textContent('[data-testid="password-error"]');
      expect(errorText).toContain('Password must be at least 8 characters');
    });

    test('should handle duplicate email registration', async () => {
      await page.goto('http://localhost:3000/signup');
      
      await page.fill('input[name="email"]', 'existing@example.com');
      await page.fill('input[name="password"]', 'SecurePass123');
      await page.fill('input[name="confirmPassword"]', 'SecurePass123');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="email-exists-error"]');
    });
  });

  describe('User Login', () => {
    test('should login with valid credentials', async () => {
      await page.goto('http://localhost:3000/login');
      
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPass123');
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard
      await page.waitForURL('**/dashboard');
      
      // Verify user is logged in
      await page.waitForSelector('[data-testid="user-avatar"]');
      
      await testUtils.takeScreenshot(page, 'login-success');
    });

    test('should reject invalid credentials', async () => {
      await page.goto('http://localhost:3000/login');
      
      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await page.waitForSelector('[data-testid="login-error"]');
      const errorText = await page.textContent('[data-testid="login-error"]');
      expect(errorText).toContain('Invalid credentials');
    });

    test('should handle network errors gracefully', async () => {
      // Intercept and fail API requests
      await page.route('**/api/auth/login', route => {
        route.abort();
      });
      
      await page.goto('http://localhost:3000/login');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'TestPass123');
      await page.click('button[type="submit"]');
      
      // Should show network error
      await page.waitForSelector('[data-testid="network-error"]');
    });
  });

  describe('Session Management', () => {
    test('should maintain session across page refreshes', async () => {
      await testUtils.login(page);
      
      // Refresh page
      await page.reload();
      
      // Should still be logged in
      await page.waitForSelector('[data-testid="user-avatar"]');
      expect(page.url()).toContain('/dashboard');
    });

    test('should logout successfully', async () => {
      await testUtils.login(page);
      
      // Click logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      
      // Should redirect to login
      await page.waitForURL('**/login');
      
      // Verify logged out state
      const isLoggedOut = await page.locator('input[type="email"]').isVisible();
      expect(isLoggedOut).toBe(true);
    });

    test('should redirect to login when accessing protected routes', async () => {
      // Clear any existing sessions
      await page.context().clearCookies();
      await page.goto('http://localhost:3000/dashboard');
      
      // Should redirect to login
      await page.waitForURL('**/login');
    });
  });
});
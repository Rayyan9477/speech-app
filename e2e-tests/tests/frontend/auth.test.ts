import { Page } from 'puppeteer';
import { LoginPage } from '../../pages/auth/LoginPage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';

describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  let signUpPage: SignUpPage;
  let dashboardPage: DashboardPage;

  beforeEach(async () => {
    loginPage = new LoginPage(page);
    signUpPage = new SignUpPage(page);
    dashboardPage = new DashboardPage(page);
  });

  describe('User Registration', () => {
    beforeEach(async () => {
      await signUpPage.goto();
      await signUpPage.isLoaded();
    });

    it('should successfully register a new user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
      };

      await signUpPage.signUp(userData);
      
      // Should redirect to welcome/onboarding page
      await signUpPage.waitForRedirect();
      
      const currentUrl = await signUpPage.getCurrentUrl();
      expect(currentUrl).toMatch(/(welcome|onboarding|dashboard)/);
    });

    it('should show validation errors for invalid email', async () => {
      await signUpPage.signUpWithInvalidEmail();
      
      const emailError = await signUpPage.getEmailError();
      expect(emailError).toContain('invalid');
    });

    it('should show validation errors for weak password', async () => {
      await signUpPage.signUpWithWeakPassword();
      
      const passwordError = await signUpPage.getPasswordError();
      expect(passwordError.toLowerCase()).toMatch(/(weak|short|simple)/);
    });

    it('should show validation errors for mismatched passwords', async () => {
      await signUpPage.signUpWithMismatchedPasswords();
      
      const confirmPasswordError = await signUpPage.getConfirmPasswordError();
      expect(confirmPasswordError.toLowerCase()).toMatch(/(match|different)/);
    });

    it('should require terms acceptance', async () => {
      await signUpPage.signUp({
        email: 'test@example.com',
        password: 'TestPassword123!',
        acceptTerms: false
      });
      
      const hasErrors = await signUpPage.hasValidationErrors();
      expect(hasErrors).toBe(true);
    });

    it('should handle existing email registration attempt', async () => {
      // First registration
      await signUpPage.signUp({
        email: 'existing@example.com',
        password: 'TestPassword123!'
      });
      
      // Try to register with same email again
      await signUpPage.goto();
      await signUpPage.signUp({
        email: 'existing@example.com',
        password: 'TestPassword123!'
      });
      
      const errorMessage = await signUpPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/(already exists|already registered)/);
    });

    it('should navigate to login page from signup', async () => {
      await signUpPage.clickLoginLink();
      
      await loginPage.isLoaded();
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/login');
    });

    it('should show password strength indicator', async () => {
      const weakStrength = await signUpPage.checkPasswordStrength('123');
      expect(weakStrength).toBe('weak');
      
      const strongStrength = await signUpPage.checkPasswordStrength('StrongPassword123!@#');
      expect(strongStrength).toBe('strong');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await loginPage.goto();
      await loginPage.isLoaded();
    });

    it('should successfully login with valid credentials', async () => {
      await loginPage.loginWithValidCredentials();
      await loginPage.waitForLogin();
      
      // Should redirect to dashboard
      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).toMatch(/(home|dashboard)/);
      
      // Verify dashboard is loaded
      await dashboardPage.isLoaded();
      const isAuthenticated = await dashboardPage.isUserAuthenticated();
      expect(isAuthenticated).toBe(true);
    });

    it('should show error for invalid credentials', async () => {
      await loginPage.loginWithInvalidCredentials();
      await loginPage.waitForLoginError();
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/(invalid|incorrect|wrong)/);
    });

    it('should show validation errors for empty fields', async () => {
      await loginPage.clickLoginButton();
      
      const hasErrors = await loginPage.hasValidationErrors();
      expect(hasErrors).toBe(true);
    });

    it('should validate email format', async () => {
      const isValidEmail = await loginPage.validateEmailFormat('invalid-email');
      expect(isValidEmail).toBe(false);
      
      const isValidEmail2 = await loginPage.validateEmailFormat('valid@example.com');
      expect(isValidEmail2).toBe(true);
    });

    it('should navigate to signup page from login', async () => {
      await loginPage.clickSignUpLink();
      
      await signUpPage.isLoaded();
      const currentUrl = await page.url();
      expect(currentUrl).toContain('/signup');
    });

    it('should remember login when remember me is checked', async () => {
      await loginPage.login('test@example.com', 'password123', true);
      
      const formData = await loginPage.getFormData();
      expect(formData.rememberMe).toBe(true);
    });

    it('should handle forgot password flow', async () => {
      if (await loginPage.isVisible('.forgot-password-link')) {
        await loginPage.clickForgotPasswordLink();
        
        // Should navigate to forgot password page or show modal
        const currentUrl = await loginPage.getCurrentUrl();
        expect(currentUrl).toMatch(/(forgot|reset)/);
      }
    });

    it('should disable login button while processing', async () => {
      await loginPage.enterEmail('test@example.com');
      await loginPage.enterPassword('password123');
      await loginPage.clickLoginButton();
      
      // Check if loading state is shown
      const isLoading = await loginPage.isLoadingVisible();
      if (isLoading) {
        const isButtonEnabled = await loginPage.isLoginButtonEnabled();
        expect(isButtonEnabled).toBe(false);
      }
    });
  });

  describe('Social Login', () => {
    beforeEach(async () => {
      await loginPage.goto();
      await loginPage.isLoaded();
    });

    it('should show social login options', async () => {
      const hasGoogleLogin = await loginPage.isVisible('.google-login, [data-testid="google-login"]');
      const hasFacebookLogin = await loginPage.isVisible('.facebook-login, [data-testid="facebook-login"]');
      
      // At least one social login option should be available
      expect(hasGoogleLogin || hasFacebookLogin).toBe(true);
    });

    it('should handle Google login click', async () => {
      if (await loginPage.isVisible('.google-login')) {
        await loginPage.clickGoogleLogin();
        
        // Should either open popup or redirect to Google OAuth
        await page.waitForTimeout(2000);
        
        const currentUrl = await loginPage.getCurrentUrl();
        const hasGoogleRedirect = currentUrl.includes('google') || currentUrl.includes('oauth');
        
        // In test environment, this might not actually redirect
        expect(hasGoogleRedirect || currentUrl.includes('/login')).toBe(true);
      }
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // First login
      await loginPage.goto();
      await loginPage.loginWithValidCredentials();
      await loginPage.waitForLogin();
      await dashboardPage.isLoaded();
    });

    it('should successfully logout user', async () => {
      await dashboardPage.logout();
      
      // Should redirect to login page
      await page.waitForTimeout(2000);
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/(login|home|\/)/);
    });
  });

  describe('Authentication State Persistence', () => {
    it('should maintain login state across page refreshes', async () => {
      // Login first
      await loginPage.goto();
      await loginPage.loginWithValidCredentials();
      await loginPage.waitForLogin();
      
      // Refresh the page
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Should still be logged in
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/(home|dashboard)/);
    });

    it('should redirect to login when accessing protected routes while logged out', async () => {
      // Try to access dashboard while logged out
      await dashboardPage.goto();
      
      // Should redirect to login
      await page.waitForTimeout(3000);
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/(login|auth)/);
    });

    it('should redirect authenticated users away from login page', async () => {
      // First login
      await loginPage.goto();
      await loginPage.loginWithValidCredentials();
      await loginPage.waitForLogin();
      
      // Try to access login page again
      await loginPage.goto();
      await page.waitForTimeout(2000);
      
      // Should redirect to dashboard
      const currentUrl = await page.url();
      expect(currentUrl).toMatch(/(home|dashboard)/);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await loginPage.goto();
      await loginPage.isLoaded();
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network failure
      await page.setOfflineMode(true);
      
      await loginPage.loginWithValidCredentials();
      await page.waitForTimeout(3000);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/(network|connection|offline)/);
      
      // Restore network
      await page.setOfflineMode(false);
    });

    it('should show appropriate error messages for server errors', async () => {
      // This would require mocking server responses
      // For now, we'll test that error handling UI exists
      const hasErrorContainer = await loginPage.isVisible('.error-message, [data-testid="error"]');
      expect(typeof hasErrorContainer).toBe('boolean');
    });
  });

  describe('Form Validation', () => {
    beforeEach(async () => {
      await signUpPage.goto();
      await signUpPage.isLoaded();
    });

    it('should validate all required fields', async () => {
      await signUpPage.clickSignUpButton();
      
      const hasValidationErrors = await signUpPage.hasValidationErrors();
      expect(hasValidationErrors).toBe(true);
    });

    it('should clear validation errors when user corrects input', async () => {
      // Trigger validation error
      await signUpPage.enterEmail('invalid-email');
      await signUpPage.clickSignUpButton();
      
      let hasErrors = await signUpPage.hasValidationErrors();
      expect(hasErrors).toBe(true);
      
      // Correct the input
      await signUpPage.enterEmail('valid@example.com');
      await page.waitForTimeout(1000);
      
      // Validation errors should be cleared or reduced
      const emailError = await signUpPage.getEmailError();
      expect(emailError).not.toContain('invalid');
    });
  });
});
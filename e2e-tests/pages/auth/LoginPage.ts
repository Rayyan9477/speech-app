import { Page } from 'puppeteer';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  private selectors = {
    emailInput: 'input[name="email"], input[type="email"], #email',
    passwordInput: 'input[name="password"], input[type="password"], #password',
    loginButton: 'button[type="submit"], .login-button, .sign-in-button',
    signUpLink: 'a[href*="signup"], .signup-link, .register-link',
    forgotPasswordLink: 'a[href*="forgot"], .forgot-password-link',
    errorMessage: '.error-message, .alert-error, [role="alert"]',
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    rememberMeCheckbox: 'input[name="remember"], #remember-me',
    
    // Social login buttons
    googleLoginButton: '.google-login, [data-testid="google-login"]',
    facebookLoginButton: '.facebook-login, [data-testid="facebook-login"]',
    
    // Form validation
    emailError: '.email-error, [data-testid="email-error"]',
    passwordError: '.password-error, [data-testid="password-error"]'
  };

  constructor(page: Page) {
    super(page, '/login');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector(this.selectors.emailInput, 5000);
      await this.waitForSelector(this.selectors.passwordInput, 5000);
      await this.waitForSelector(this.selectors.loginButton, 5000);
      return true;
    } catch {
      return false;
    }
  }

  // Login actions
  async enterEmail(email: string): Promise<void> {
    await this.type(this.selectors.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.selectors.passwordInput, password);
  }

  async clickLoginButton(): Promise<void> {
    await this.click(this.selectors.loginButton);
  }

  async checkRememberMe(): Promise<void> {
    if (await this.isVisible(this.selectors.rememberMeCheckbox)) {
      await this.checkCheckbox(this.selectors.rememberMeCheckbox, true);
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    
    if (rememberMe) {
      await this.checkRememberMe();
    }
    
    await this.clickLoginButton();
  }

  async loginWithValidCredentials(): Promise<void> {
    await this.login('test@example.com', 'password123');
  }

  async loginWithInvalidCredentials(): Promise<void> {
    await this.login('invalid@example.com', 'wrongpassword');
  }

  // Navigation
  async clickSignUpLink(): Promise<void> {
    await this.click(this.selectors.signUpLink);
  }

  async clickForgotPasswordLink(): Promise<void> {
    await this.click(this.selectors.forgotPasswordLink);
  }

  // Social login
  async clickGoogleLogin(): Promise<void> {
    if (await this.isVisible(this.selectors.googleLoginButton)) {
      await this.click(this.selectors.googleLoginButton);
    }
  }

  async clickFacebookLogin(): Promise<void> {
    if (await this.isVisible(this.selectors.facebookLoginButton)) {
      await this.click(this.selectors.facebookLoginButton);
    }
  }

  // Validation and error handling
  async getErrorMessage(): Promise<string> {
    if (await this.isVisible(this.selectors.errorMessage)) {
      return await this.getText(this.selectors.errorMessage);
    }
    return '';
  }

  async getEmailError(): Promise<string> {
    if (await this.isVisible(this.selectors.emailError)) {
      return await this.getText(this.selectors.emailError);
    }
    return '';
  }

  async getPasswordError(): Promise<string> {
    if (await this.isVisible(this.selectors.passwordError)) {
      return await this.getText(this.selectors.passwordError);
    }
    return '';
  }

  async hasValidationErrors(): Promise<boolean> {
    const emailError = await this.getEmailError();
    const passwordError = await this.getPasswordError();
    const generalError = await this.getErrorMessage();
    
    return !!(emailError || passwordError || generalError);
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.selectors.loginButton);
  }

  async isLoadingVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.loadingSpinner);
  }

  // Wait methods
  async waitForLogin(): Promise<void> {
    // Wait for redirect to dashboard or successful login indication
    await this.page.waitForFunction(
      () => window.location.pathname.includes('/home') || 
            window.location.pathname.includes('/dashboard') ||
            window.location.pathname.includes('/welcome'),
      { timeout: 15000 }
    );
  }

  async waitForLoginError(): Promise<void> {
    await this.waitForElement(this.selectors.errorMessage, 'visible', 10000);
  }

  // Form validation
  async validateEmailFormat(email: string): Promise<boolean> {
    await this.enterEmail(email);
    await this.click(this.selectors.passwordInput); // Trigger validation by clicking away
    
    const emailError = await this.getEmailError();
    return !emailError.includes('invalid') && !emailError.includes('format');
  }

  async validatePasswordStrength(password: string): Promise<boolean> {
    await this.enterPassword(password);
    await this.click(this.selectors.emailInput); // Trigger validation by clicking away
    
    const passwordError = await this.getPasswordError();
    return !passwordError.includes('weak') && !passwordError.includes('strength');
  }

  // Test helper methods
  async fillFormWithTestData(): Promise<void> {
    await this.enterEmail('e2e-test@example.com');
    await this.enterPassword('TestPassword123!');
  }

  async clearForm(): Promise<void> {
    await this.clearInput(this.selectors.emailInput);
    await this.clearInput(this.selectors.passwordInput);
  }

  async getFormData(): Promise<{ email: string; password: string; rememberMe: boolean }> {
    const email = await this.getValue(this.selectors.emailInput);
    const password = await this.getValue(this.selectors.passwordInput);
    
    let rememberMe = false;
    if (await this.isVisible(this.selectors.rememberMeCheckbox)) {
      rememberMe = await this.page.$eval(this.selectors.rememberMeCheckbox, el => (el as HTMLInputElement).checked);
    }
    
    return { email, password, rememberMe };
  }
}
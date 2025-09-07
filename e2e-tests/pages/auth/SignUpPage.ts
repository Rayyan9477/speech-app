import { Page } from 'puppeteer';
import { BasePage } from '../BasePage';

export class SignUpPage extends BasePage {
  private selectors = {
    // Basic form fields
    nameInput: 'input[name="name"], input[name="fullName"], #name, #full-name',
    emailInput: 'input[name="email"], input[type="email"], #email',
    passwordInput: 'input[name="password"], input[type="password"], #password',
    confirmPasswordInput: 'input[name="confirmPassword"], input[name="password_confirmation"], #confirm-password',
    
    // Sign up button
    signUpButton: 'button[type="submit"], .signup-button, .register-button',
    
    // Navigation links
    loginLink: 'a[href*="login"], .login-link, .sign-in-link',
    
    // Terms and conditions
    termsCheckbox: 'input[name="terms"], input[name="acceptTerms"], #terms',
    privacyCheckbox: 'input[name="privacy"], input[name="acceptPrivacy"], #privacy',
    
    // Error messages
    errorMessage: '.error-message, .alert-error, [role="alert"]',
    nameError: '.name-error, [data-testid="name-error"]',
    emailError: '.email-error, [data-testid="email-error"]',
    passwordError: '.password-error, [data-testid="password-error"]',
    confirmPasswordError: '.confirm-password-error, [data-testid="confirm-password-error"]',
    termsError: '.terms-error, [data-testid="terms-error"]',
    
    // Loading and success states
    loadingSpinner: '.loading, .spinner, [data-testid="loading"]',
    successMessage: '.success-message, .alert-success, [data-testid="success"]',
    
    // Social sign up
    googleSignUpButton: '.google-signup, [data-testid="google-signup"]',
    facebookSignUpButton: '.facebook-signup, [data-testid="facebook-signup"]',
    
    // Password strength indicator
    passwordStrengthIndicator: '.password-strength, [data-testid="password-strength"]',
    
    // Role selection (if part of signup)
    roleSelect: 'select[name="role"], #role',
    companyInput: 'input[name="company"], #company'
  };

  constructor(page: Page) {
    super(page, '/signup');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.waitForSelector(this.selectors.emailInput, 5000);
      await this.waitForSelector(this.selectors.passwordInput, 5000);
      await this.waitForSelector(this.selectors.signUpButton, 5000);
      return true;
    } catch {
      return false;
    }
  }

  // Form filling methods
  async enterName(name: string): Promise<void> {
    if (await this.isVisible(this.selectors.nameInput)) {
      await this.type(this.selectors.nameInput, name);
    }
  }

  async enterEmail(email: string): Promise<void> {
    await this.type(this.selectors.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.selectors.passwordInput, password);
  }

  async enterConfirmPassword(password: string): Promise<void> {
    if (await this.isVisible(this.selectors.confirmPasswordInput)) {
      await this.type(this.selectors.confirmPasswordInput, password);
    }
  }

  async enterCompany(company: string): Promise<void> {
    if (await this.isVisible(this.selectors.companyInput)) {
      await this.type(this.selectors.companyInput, company);
    }
  }

  async selectRole(role: string): Promise<void> {
    if (await this.isVisible(this.selectors.roleSelect)) {
      await this.selectOption(this.selectors.roleSelect, role);
    }
  }

  // Checkbox interactions
  async acceptTerms(): Promise<void> {
    if (await this.isVisible(this.selectors.termsCheckbox)) {
      await this.checkCheckbox(this.selectors.termsCheckbox, true);
    }
  }

  async acceptPrivacyPolicy(): Promise<void> {
    if (await this.isVisible(this.selectors.privacyCheckbox)) {
      await this.checkCheckbox(this.selectors.privacyCheckbox, true);
    }
  }

  // Sign up actions
  async clickSignUpButton(): Promise<void> {
    await this.click(this.selectors.signUpButton);
  }

  async signUp(userData: {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    company?: string;
    role?: string;
    acceptTerms?: boolean;
    acceptPrivacy?: boolean;
  }): Promise<void> {
    const {
      name,
      email,
      password,
      confirmPassword,
      company,
      role,
      acceptTerms = true,
      acceptPrivacy = true
    } = userData;

    if (name) await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    if (confirmPassword) await this.enterConfirmPassword(confirmPassword);
    if (company) await this.enterCompany(company);
    if (role) await this.selectRole(role);
    
    if (acceptTerms) await this.acceptTerms();
    if (acceptPrivacy) await this.acceptPrivacyPolicy();
    
    await this.clickSignUpButton();
  }

  async signUpWithValidData(): Promise<void> {
    await this.signUp({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      company: 'Test Company',
      role: 'user'
    });
  }

  async signUpWithInvalidEmail(): Promise<void> {
    await this.signUp({
      email: 'invalid-email',
      password: 'TestPassword123!'
    });
  }

  async signUpWithWeakPassword(): Promise<void> {
    await this.signUp({
      email: 'test@example.com',
      password: '123'
    });
  }

  async signUpWithMismatchedPasswords(): Promise<void> {
    await this.signUp({
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'DifferentPassword456!'
    });
  }

  // Navigation
  async clickLoginLink(): Promise<void> {
    await this.click(this.selectors.loginLink);
  }

  // Social sign up
  async clickGoogleSignUp(): Promise<void> {
    if (await this.isVisible(this.selectors.googleSignUpButton)) {
      await this.click(this.selectors.googleSignUpButton);
    }
  }

  async clickFacebookSignUp(): Promise<void> {
    if (await this.isVisible(this.selectors.facebookSignUpButton)) {
      await this.click(this.selectors.facebookSignUpButton);
    }
  }

  // Validation and error handling
  async getErrorMessage(): Promise<string> {
    if (await this.isVisible(this.selectors.errorMessage)) {
      return await this.getText(this.selectors.errorMessage);
    }
    return '';
  }

  async getNameError(): Promise<string> {
    if (await this.isVisible(this.selectors.nameError)) {
      return await this.getText(this.selectors.nameError);
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

  async getConfirmPasswordError(): Promise<string> {
    if (await this.isVisible(this.selectors.confirmPasswordError)) {
      return await this.getText(this.selectors.confirmPasswordError);
    }
    return '';
  }

  async getTermsError(): Promise<string> {
    if (await this.isVisible(this.selectors.termsError)) {
      return await this.getText(this.selectors.termsError);
    }
    return '';
  }

  async hasValidationErrors(): Promise<boolean> {
    const errors = [
      await this.getNameError(),
      await this.getEmailError(),
      await this.getPasswordError(),
      await this.getConfirmPasswordError(),
      await this.getTermsError(),
      await this.getErrorMessage()
    ];
    
    return errors.some(error => error.length > 0);
  }

  // Password strength
  async getPasswordStrength(): Promise<string> {
    if (await this.isVisible(this.selectors.passwordStrengthIndicator)) {
      return await this.getText(this.selectors.passwordStrengthIndicator);
    }
    return '';
  }

  async checkPasswordStrength(password: string): Promise<'weak' | 'medium' | 'strong' | 'unknown'> {
    await this.enterPassword(password);
    await this.page.waitForTimeout(1000); // Wait for strength calculation
    
    const strengthText = await this.getPasswordStrength();
    const lowerText = strengthText.toLowerCase();
    
    if (lowerText.includes('weak')) return 'weak';
    if (lowerText.includes('medium')) return 'medium';
    if (lowerText.includes('strong')) return 'strong';
    
    return 'unknown';
  }

  // State checks
  async isSignUpButtonEnabled(): Promise<boolean> {
    return await this.isEnabled(this.selectors.signUpButton);
  }

  async isLoadingVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.loadingSpinner);
  }

  async isSuccessMessageVisible(): Promise<boolean> {
    return await this.isVisible(this.selectors.successMessage);
  }

  // Wait methods
  async waitForSignUpSuccess(): Promise<void> {
    await this.waitForElement(this.selectors.successMessage, 'visible', 15000);
  }

  async waitForSignUpError(): Promise<void> {
    await this.waitForElement(this.selectors.errorMessage, 'visible', 10000);
  }

  async waitForRedirect(): Promise<void> {
    await this.page.waitForFunction(
      () => window.location.pathname.includes('/welcome') || 
            window.location.pathname.includes('/onboarding') ||
            window.location.pathname.includes('/dashboard'),
      { timeout: 15000 }
    );
  }

  // Form helpers
  async clearForm(): Promise<void> {
    const inputs = [
      this.selectors.nameInput,
      this.selectors.emailInput,
      this.selectors.passwordInput,
      this.selectors.confirmPasswordInput,
      this.selectors.companyInput
    ];

    for (const input of inputs) {
      if (await this.isVisible(input)) {
        await this.clearInput(input);
      }
    }
  }

  async getFormData(): Promise<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    company: string;
    role: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }> {
    const name = await this.isVisible(this.selectors.nameInput) ? await this.getValue(this.selectors.nameInput) : '';
    const email = await this.getValue(this.selectors.emailInput);
    const password = await this.getValue(this.selectors.passwordInput);
    const confirmPassword = await this.isVisible(this.selectors.confirmPasswordInput) ? await this.getValue(this.selectors.confirmPasswordInput) : '';
    const company = await this.isVisible(this.selectors.companyInput) ? await this.getValue(this.selectors.companyInput) : '';
    
    let role = '';
    if (await this.isVisible(this.selectors.roleSelect)) {
      role = await this.page.$eval(this.selectors.roleSelect, el => (el as HTMLSelectElement).value);
    }

    let termsAccepted = false;
    if (await this.isVisible(this.selectors.termsCheckbox)) {
      termsAccepted = await this.page.$eval(this.selectors.termsCheckbox, el => (el as HTMLInputElement).checked);
    }

    let privacyAccepted = false;
    if (await this.isVisible(this.selectors.privacyCheckbox)) {
      privacyAccepted = await this.page.$eval(this.selectors.privacyCheckbox, el => (el as HTMLInputElement).checked);
    }

    return {
      name,
      email,
      password,
      confirmPassword,
      company,
      role,
      termsAccepted,
      privacyAccepted
    };
  }
}
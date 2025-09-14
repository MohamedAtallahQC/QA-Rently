import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AdminUser } from '../../utils/TestData';

/**
 * Page Object Model for Admin Login Page
 */
export class AdminLoginPage extends BasePage {
  // Selectors
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly rememberMeCheckbox: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly loadingSpinner: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;
  private readonly pageTitle: Locator;
  private readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').first();
    this.passwordInput = page.locator('input[type="password"], input[name*="password"], input[placeholder*="password"]').first();
    this.rememberMeCheckbox = page.locator('input[type="checkbox"], [data-testid="remember-me"]').first();
    this.forgotPasswordLink = page.locator('a:has-text("نسيت كلمة المرور"), a:has-text("Forgot Password")').first();
    this.loginButton = page.locator('button:has-text("تسجيل الدخول"), button:has-text("Login"), button[type="submit"]').first();
    this.errorMessage = page.locator('[data-testid="error"], .error, .alert-danger, .error-message').first();
    this.successMessage = page.locator('[data-testid="success"], .success, .alert-success').first();
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner').first();
    this.languageToggle = page.locator('button:has-text("العربية"), button:has-text("English")').first();
    this.themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /login|تسجيل|دخول/i }).first();
    this.loginForm = page.locator('form, .login-form, [data-testid="login-form"]').first();

  }

  /**
   * Navigate to admin login page
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/ar/login');
    await this.waitForPageLoad();
  }

  /**
   * Fill email address
   */
  async enterEmail(email: string): Promise<void> {
    await this.fillInput(this.emailInput, email);
  }

  /**
   * Fill password
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillInput(this.passwordInput, password);
  }

  /**
   * Check remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    await this.checkCheckbox(this.rememberMeCheckbox);
  }

  /**
   * Uncheck remember me checkbox
   */
  async uncheckRememberMe(): Promise<void> {
    await this.uncheckCheckbox(this.rememberMeCheckbox);
  }

  /**
   * Click login button
   */
  async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPasswordLink(): Promise<void> {
    await this.clickElement(this.forgotPasswordLink);
  }

  /**
   * Complete login process
   */
  async login(adminUser: AdminUser): Promise<void> {
    await this.enterEmail(adminUser.email);
    await this.enterPassword(adminUser.password);
    
    if (adminUser.rememberMe) {
      await this.checkRememberMe();
    }
    
    await this.clickLoginButton();
    await this.waitForLoadingToComplete();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isElementVisible(this.errorMessage)) {
      return await this.getText(this.errorMessage);
    }
    return '';
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    if (await this.isElementVisible(this.successMessage)) {
      return await this.getText(this.successMessage);
    }
    return '';
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Check if success message is displayed
   */
  async isSuccessMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.successMessage);
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoadingSpinnerVisible(): Promise<boolean> {
    return await this.isElementVisible(this.loadingSpinner);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete(): Promise<void> {
    if (await this.isLoadingSpinnerVisible()) {
      await this.waitForElementToBeHidden(this.loadingSpinner);
    }
  }

  /**
   * Toggle language
   */
  async toggleLanguage(): Promise<void> {
    if (await this.isElementVisible(this.languageToggle)) {
      await this.clickElement(this.languageToggle);
    }
  }

  /**
   * Toggle theme
   */
  async toggleTheme(): Promise<void> {
    if (await this.isElementVisible(this.themeToggle)) {
      await this.clickElement(this.themeToggle);
    }
  }

  /**
   * Get page title
   */
  override async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * Verify page elements are visible
   */
  async verifyPageElements(): Promise<void> {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }

  /**
   * Clear form
   */
  async clearForm(): Promise<void> {
    await this.fillInput(this.emailInput, '');
    await this.fillInput(this.passwordInput, '');
    await this.uncheckRememberMe();
  }

  /**
   * Check if form is valid
   */
  async isFormValid(): Promise<boolean> {
    const emailValue = await this.emailInput.inputValue();
    const passwordValue = await this.passwordInput.inputValue();
    return emailValue.length > 0 && passwordValue.length > 0;
  }

  /**
   * Get email value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Get password value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.loginButton);
  }

  /**
   * Wait for navigation after successful login
   */
  async waitForNavigationAfterLogin(): Promise<void> {
    await this.page.waitForURL(/dashboard|admin|home/, { timeout: 15000 });
  }

  /**
   * Verify login was successful
   */
  async verifyLoginSuccess(): Promise<boolean> {
    try {
      await this.waitForNavigationAfterLogin();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot of login form
   */
  async takeLoginFormScreenshot(): Promise<void> {
    await this.takeScreenshot('admin-login-form');
  }

  /**
   * Verify login form is displayed
   */
  async verifyLoginFormDisplayed(): Promise<boolean> {
    try {
      await this.waitForElement(this.loginForm, 5000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get form validation errors
   */
  async getFormValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // Check for HTML5 validation errors
    const emailValidation = await this.emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (emailValidation) {
      errors.push(`Email: ${emailValidation}`);
    }
    
    const passwordValidation = await this.passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    if (passwordValidation) {
      errors.push(`Password: ${passwordValidation}`);
    }
    
    return errors;
  }

  /**
   * Wait for form to be ready
   */
  async waitForFormReady(): Promise<void> {
    await this.waitForElement(this.emailInput);
    await this.waitForElement(this.passwordInput);
    await this.waitForElement(this.loginButton);
  }
}

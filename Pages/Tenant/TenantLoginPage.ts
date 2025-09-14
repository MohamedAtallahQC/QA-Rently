import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TenantUser } from '../../utils/TestData';

/**
 * Page Object Model for Tenant Login Page
 */
export class TenantLoginPage extends BasePage {
  // Selectors
  private readonly phoneNumberInput: Locator;
  private readonly startDateInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;
  private readonly successMessage: Locator;
  private readonly loadingSpinner: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.phoneNumberInput = page.locator('input[placeholder*="phone"], input[placeholder*="Phone"], input[type="tel"]').first();
    this.startDateInput = page.locator('input[type="date"], input[placeholder*="date"], input[placeholder*="Date"]').first();
    this.submitButton = page.locator('button:has-text("Start Renting"), button:has-text("Submit"), button[type="submit"]').first();
    this.errorMessage = page.locator('[data-testid="error"], .error, .alert-danger').first();
    this.successMessage = page.locator('[data-testid="success"], .success, .alert-success').first();
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner').first();
    this.languageToggle = page.locator('button:has-text("العربية"), button:has-text("English")').first();
    this.themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
  }

  /**
   * Navigate to tenant login page
   */
  async navigateToLoginPage(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  /**
   * Fill phone number
   */
  async enterPhoneNumber(phoneNumber: string): Promise<void> {
    await this.fillInput(this.phoneNumberInput, phoneNumber);
  }

  /**
   * Fill start date
   */
  async enterStartDate(startDate: string): Promise<void> {
    await this.fillInput(this.startDateInput, startDate);
  }

  /**
   * Click submit button
   */
  async clickSubmitButton(): Promise<void> {
    await this.clickElement(this.submitButton);
  }

  /**
   * Complete login process
   */
  async login(tenantUser: TenantUser): Promise<void> {
    await this.enterPhoneNumber(tenantUser.phoneNumber);
    await this.enterStartDate(tenantUser.startDate);
    await this.clickSubmitButton();
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
   * Verify page elements are visible
   */
  async verifyPageElements(): Promise<void> {
    await this.waitForElement(this.phoneNumberInput);
    await this.waitForElement(this.startDateInput);
    await this.waitForElement(this.submitButton);
  }

  /**
   * Clear form
   */
  async clearForm(): Promise<void> {
    await this.fillInput(this.phoneNumberInput, '');
    await this.fillInput(this.startDateInput, '');
  }

  /**
   * Check if form is valid
   */
  async isFormValid(): Promise<boolean> {
    const phoneValue = await this.phoneNumberInput.inputValue();
    const dateValue = await this.startDateInput.inputValue();
    return phoneValue.length > 0 && dateValue.length > 0;
  }

  /**
   * Get phone number value
   */
  async getPhoneNumberValue(): Promise<string> {
    return await this.phoneNumberInput.inputValue();
  }

  /**
   * Get start date value
   */
  async getStartDateValue(): Promise<string> {
    return await this.startDateInput.inputValue();
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.submitButton);
  }

  /**
   * Wait for navigation after successful login
   */
  async waitForNavigationAfterLogin(): Promise<void> {
    await this.page.waitForURL(/dashboard|rent|installment/, { timeout: 15000 });
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
    await this.takeScreenshot('tenant-login-form');
  }
}

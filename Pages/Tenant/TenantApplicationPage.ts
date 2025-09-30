import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for Rently Tenant Application Page
 *
 * This class provides methods to interact with the tenant application page at https://dev.rently.sa/en/tenant-application
 * The page includes:
 * - Identity verification section (National ID, Birth Date)
 * - Phone number and OTP verification
 * - Rental request details (Start Date, Rental Amount)
 * - Consent checkboxes (Landlord contact, Terms & Simah credit inquiry)
 * - Multi-step form progression
 * - Form validation and error handling
 *
 * @example
 * const tenantApplicationPage = new TenantApplicationPage(page);
 * await tenantApplicationPage.navigateToTenantApplication();
 * await tenantApplicationPage.fillIdentityVerificationDetails('1234567890', '1990-01-01');
 * await tenantApplicationPage.submitIdentityVerification();
 */
export class TenantApplicationPage extends BasePage {
  // Page containers
  private readonly pageContainer: Locator;
  private readonly formContainer: Locator;
  private readonly stepIndicator: Locator;

  // Identity Verification Section
  private readonly identitySection: Locator;
  private readonly nationalIdInput: Locator;
  private readonly birthDateInput: Locator;
  private readonly identitySubmitButton: Locator;

  // Phone Number Section
  private readonly phoneSection: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly phoneSubmitButton: Locator;

  // OTP Verification Section
  private readonly otpSection: Locator;
  private readonly otpInput: Locator;
  private readonly otpSubmitButton: Locator;
  private readonly resendOtpButton: Locator;
  private readonly otpTimer: Locator;

  // Rental Request Section
  private readonly rentalRequestSection: Locator;
  private readonly startDateInput: Locator;
  private readonly yearlyRentalAmountInput: Locator;
  private readonly rentalRequestSubmitButton: Locator;

  // Consent Section
  private readonly consentSection: Locator;
  private readonly landlordContactConsent: Locator;
  private readonly termsAndSimahConsent: Locator;
  private readonly finalSubmitButton: Locator;

  // Navigation and Common Elements
  private readonly backButton: Locator;
  private readonly nextButton: Locator;
  private readonly progressBar: Locator;

  // Validation and Error Messages
  private readonly errorMessages: Locator;
  private readonly successMessages: Locator;
  private readonly fieldErrors: Locator;
  private readonly formValidationSummary: Locator;

  // Loading States
  private readonly loadingSpinner: Locator;
  private readonly submitLoader: Locator;

  // Header Navigation
  private readonly navigationMenu: Locator;
  private readonly homeLink: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page, 'https://dev.rently.sa/en');

    // Page containers
    this.pageContainer = page.locator('main, .main-content, [role="main"]');
    this.formContainer = page.locator('form, .application-form, .tenant-application');
    this.stepIndicator = page.locator('.step-indicator, .progress-steps, [aria-label*="step"]');

    // Identity Verification Section
    this.identitySection = page.locator('.identity-verification, .verify-identity, [data-step="identity"]');
    this.nationalIdInput = page.locator('input[name*="national"], input[placeholder*="National"], input[id*="national"]');
    this.birthDateInput = page.locator('input[name*="birth"], input[type="date"], input[placeholder*="birth"], input[id*="birth"]');
    this.identitySubmitButton = page.locator('button:has-text("Verify"), button:has-text("Submit"), button[type="submit"]').first();

    // Phone Number Section
    this.phoneSection = page.locator('.phone-verification, .phone-section, [data-step="phone"]');
    this.phoneNumberInput = page.locator('input[name*="phone"], input[type="tel"], input[placeholder*="phone"], input[id*="phone"]');
    this.phoneSubmitButton = page.locator('button:has-text("Send"), button:has-text("Continue"), button[type="submit"]').nth(1);

    // OTP Verification Section
    this.otpSection = page.locator('.otp-verification, .otp-section, [data-step="otp"]');
    this.otpInput = page.locator('input[name*="otp"], input[placeholder*="OTP"], input[placeholder*="code"], input[id*="otp"]');
    this.otpSubmitButton = page.locator('button:has-text("Verify"), button:has-text("Confirm"), .otp-section button[type="submit"]');
    this.resendOtpButton = page.locator('button:has-text("Resend"), a:has-text("Resend")');
    this.otpTimer = page.locator('.timer, .countdown, [class*="timer"]');

    // Rental Request Section
    this.rentalRequestSection = page.locator('.rental-request, .application-details, [data-step="details"]');
    this.startDateInput = page.locator('input[name*="start"], input[placeholder*="Start"], input[id*="start"]').and(page.locator('input[type="date"]'));
    this.yearlyRentalAmountInput = page.locator('input[name*="rental"], input[name*="amount"], input[placeholder*="amount"], input[id*="rental"]');
    this.rentalRequestSubmitButton = page.locator('.rental-request button[type="submit"], .application-details button[type="submit"]');

    // Consent Section
    this.consentSection = page.locator('.consent-section, .agreements, [data-step="consent"]');
    this.landlordContactConsent = page.locator('input[type="checkbox"]').filter({ hasText: /landlord|contact|owner/i });
    this.termsAndSimahConsent = page.locator('input[type="checkbox"]').filter({ hasText: /terms|simah|credit|inquiry/i });
    this.finalSubmitButton = page.locator('.consent-section button[type="submit"], .final-submit, button:has-text("Submit Application")');

    // Navigation and Common Elements
    this.backButton = page.locator('button:has-text("Back"), button[aria-label*="back"], .back-button');
    this.nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), .next-button');
    this.progressBar = page.locator('.progress-bar, [role="progressbar"], .step-progress');

    // Validation and Error Messages
    this.errorMessages = page.locator('.error, .error-message, [role="alert"], .alert-error');
    this.successMessages = page.locator('.success, .success-message, .alert-success');
    this.fieldErrors = page.locator('.field-error, .input-error, .validation-error');
    this.formValidationSummary = page.locator('.validation-summary, .form-errors');

    // Loading States
    this.loadingSpinner = page.locator('.loading, .spinner, [aria-label*="loading"]');
    this.submitLoader = page.locator('button .loader, button .spinner, button[disabled]');

    // Header Navigation
    this.navigationMenu = page.locator('nav, .navigation, .header-nav');
    this.homeLink = page.locator('a[href="/"], a[href="/en"], a:has-text("Home")');
    this.languageToggle = page.locator('a[href*="/ar"], button:has-text("AR"), .language-toggle');
    this.themeToggle = page.locator('.theme-toggle, .dark-mode-toggle, button[aria-label*="theme"]');
  }

  /**
   * Navigate to tenant application page
   */
  async navigateToTenantApplication(): Promise<void> {
    await this.navigateTo('/tenant-application');
    await this.waitForPageLoad();
  }

  /**
   * Verify tenant application page is loaded
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageContainer, { timeout: 10000 });
      await this.waitForElement(this.formContainer, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current page title
   */
  override async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current form step
   */
  async getCurrentStep(): Promise<string> {
    try {
      // Try to get step from step indicator
      const stepText = await this.getText(this.stepIndicator, { timeout: 2000 });
      if (stepText) return stepText.toLowerCase();

      // Fallback: determine step based on visible sections
      if (await this.isElementVisible(this.identitySection, 1000)) return 'identity';
      if (await this.isElementVisible(this.phoneSection, 1000)) return 'phone';
      if (await this.isElementVisible(this.otpSection, 1000)) return 'otp';
      if (await this.isElementVisible(this.rentalRequestSection, 1000)) return 'details';
      if (await this.isElementVisible(this.consentSection, 1000)) return 'consent';

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Check if current step is identity verification
   */
  async isIdentityVerificationStep(): Promise<boolean> {
    return await this.isElementVisible(this.identitySection);
  }

  /**
   * Check if current step is phone verification
   */
  async isPhoneVerificationStep(): Promise<boolean> {
    return await this.isElementVisible(this.phoneSection);
  }

  /**
   * Check if current step is OTP verification
   */
  async isOTPVerificationStep(): Promise<boolean> {
    return await this.isElementVisible(this.otpSection);
  }

  /**
   * Check if current step is rental request details
   */
  async isRentalRequestStep(): Promise<boolean> {
    return await this.isElementVisible(this.rentalRequestSection);
  }

  /**
   * Check if current step is consent
   */
  async isConsentStep(): Promise<boolean> {
    return await this.isElementVisible(this.consentSection);
  }

  // ========================================
  // Identity Verification Methods
  // ========================================

  /**
   * Fill National ID field
   */
  async fillNationalId(nationalId: string): Promise<void> {
    await this.fillInput(this.nationalIdInput, nationalId);
  }

  /**
   * Fill Birth Date field
   */
  async fillBirthDate(birthDate: string): Promise<void> {
    await this.fillInput(this.birthDateInput, birthDate);
  }

  /**
   * Fill identity verification details
   */
  async fillIdentityVerificationDetails(nationalId: string, birthDate: string): Promise<void> {
    await this.fillNationalId(nationalId);
    await this.fillBirthDate(birthDate);
  }

  /**
   * Submit identity verification
   */
  async submitIdentityVerification(): Promise<void> {
    await this.clickElement(this.identitySubmitButton);
    await this.waitForElementToBeHidden(this.submitLoader, 10000);
  }

  /**
   * Get National ID value
   */
  async getNationalIdValue(): Promise<string> {
    return await this.nationalIdInput.inputValue();
  }

  /**
   * Get Birth Date value
   */
  async getBirthDateValue(): Promise<string> {
    return await this.birthDateInput.inputValue();
  }

  // ========================================
  // Phone Verification Methods
  // ========================================

  /**
   * Fill phone number field
   */
  async fillPhoneNumber(phoneNumber: string): Promise<void> {
    await this.fillInput(this.phoneNumberInput, phoneNumber);
  }

  /**
   * Submit phone number
   */
  async submitPhoneNumber(): Promise<void> {
    await this.clickElement(this.phoneSubmitButton);
    await this.waitForElementToBeHidden(this.submitLoader, 10000);
  }

  /**
   * Get phone number value
   */
  async getPhoneNumberValue(): Promise<string> {
    return await this.phoneNumberInput.inputValue();
  }

  // ========================================
  // OTP Verification Methods
  // ========================================

  /**
   * Fill OTP code
   */
  async fillOTPCode(otpCode: string): Promise<void> {
    await this.fillInput(this.otpInput, otpCode);
  }

  /**
   * Submit OTP verification
   */
  async verifyOTP(): Promise<void> {
    await this.clickElement(this.otpSubmitButton);
    await this.waitForElementToBeHidden(this.submitLoader, 10000);
  }

  /**
   * Click resend OTP button
   */
  async resendOTP(): Promise<void> {
    await this.clickElement(this.resendOtpButton);
  }

  /**
   * Get OTP timer text
   */
  async getOTPTimer(): Promise<string> {
    return await this.getText(this.otpTimer, { fallback: '00:00' });
  }

  /**
   * Check if resend OTP button is enabled
   */
  async isResendOTPEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.resendOtpButton);
  }

  /**
   * Get OTP input value
   */
  async getOTPValue(): Promise<string> {
    return await this.otpInput.inputValue();
  }

  // ========================================
  // Rental Request Methods
  // ========================================

  /**
   * Fill start date field
   */
  async fillStartDate(startDate: string): Promise<void> {
    await this.fillInput(this.startDateInput, startDate);
  }

  /**
   * Fill yearly rental amount field
   */
  async fillYearlyRentalAmount(amount: string): Promise<void> {
    await this.fillInput(this.yearlyRentalAmountInput, amount);
  }

  /**
   * Fill rental request details
   */
  async fillRentalRequestDetails(startDate: string, rentalAmount?: string): Promise<void> {
    await this.fillStartDate(startDate);
    if (rentalAmount) {
      await this.fillYearlyRentalAmount(rentalAmount);
    }
  }

  /**
   * Submit rental request
   */
  async submitRentalRequest(): Promise<void> {
    await this.clickElement(this.rentalRequestSubmitButton);
    await this.waitForElementToBeHidden(this.submitLoader, 10000);
  }

  /**
   * Get start date value
   */
  async getStartDateValue(): Promise<string> {
    return await this.startDateInput.inputValue();
  }

  /**
   * Get yearly rental amount value
   */
  async getYearlyRentalAmountValue(): Promise<string> {
    return await this.yearlyRentalAmountInput.inputValue();
  }

  // ========================================
  // Consent Methods
  // ========================================

  /**
   * Check landlord contact consent
   */
  async checkLandlordContactConsent(): Promise<void> {
    await this.checkCheckbox(this.landlordContactConsent);
  }

  /**
   * Check terms and Simah credit inquiry consent
   */
  async checkTermsAndSimahConsent(): Promise<void> {
    await this.checkCheckbox(this.termsAndSimahConsent);
  }

  /**
   * Check all consent checkboxes
   */
  async checkAllConsents(): Promise<void> {
    await this.checkLandlordContactConsent();
    await this.checkTermsAndSimahConsent();
  }

  /**
   * Submit final application
   */
  async submitFinalApplication(): Promise<void> {
    await this.clickElement(this.finalSubmitButton);
    await this.waitForElementToBeHidden(this.submitLoader, 15000);
  }

  /**
   * Check if landlord contact consent is checked
   */
  async isLandlordContactConsentChecked(): Promise<boolean> {
    return await this.landlordContactConsent.isChecked();
  }

  /**
   * Check if terms and Simah consent is checked
   */
  async isTermsAndSimahConsentChecked(): Promise<boolean> {
    return await this.termsAndSimahConsent.isChecked();
  }

  /**
   * Check if all consents are checked
   */
  async areAllConsentsChecked(): Promise<boolean> {
    return (await this.isLandlordContactConsentChecked()) &&
           (await this.isTermsAndSimahConsentChecked());
  }

  // ========================================
  // Complete Application Flow
  // ========================================

  /**
   * Complete full application flow
   */
  async completeApplication(applicationData: {
    nationalId: string;
    birthDate: string;
    phoneNumber: string;
    otpCode: string;
    startDate: string;
    rentalAmount?: string;
  }): Promise<void> {
    // Step 1: Identity Verification
    if (await this.isIdentityVerificationStep()) {
      await this.fillIdentityVerificationDetails(applicationData.nationalId, applicationData.birthDate);
      await this.submitIdentityVerification();
    }

    // Step 2: Phone Verification
    if (await this.isPhoneVerificationStep()) {
      await this.fillPhoneNumber(applicationData.phoneNumber);
      await this.submitPhoneNumber();
    }

    // Step 3: OTP Verification
    if (await this.isOTPVerificationStep()) {
      await this.fillOTPCode(applicationData.otpCode);
      await this.verifyOTP();
    }

    // Step 4: Rental Request Details
    if (await this.isRentalRequestStep()) {
      await this.fillRentalRequestDetails(applicationData.startDate, applicationData.rentalAmount);
      await this.submitRentalRequest();
    }

    // Step 5: Consent
    if (await this.isConsentStep()) {
      await this.checkAllConsents();
      await this.submitFinalApplication();
    }
  }

  // ========================================
  // Navigation Methods
  // ========================================

  /**
   * Click back button
   */
  async goBack(): Promise<void> {
    if (await this.isElementVisible(this.backButton)) {
      await this.clickElement(this.backButton);
    }
  }

  /**
   * Click next button
   */
  async goNext(): Promise<void> {
    if (await this.isElementVisible(this.nextButton)) {
      await this.clickElement(this.nextButton);
    }
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.clickElement(this.homeLink);
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

  // ========================================
  // Validation and Error Handling
  // ========================================

  /**
   * Get validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorElements = await this.errorMessages.all();

    for (const error of errorElements) {
      const text = await this.getText(error, { timeout: 1000 });
      if (text.trim()) {
        errors.push(text.trim());
      }
    }

    return errors;
  }

  /**
   * Get field-specific errors
   */
  async getFieldErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorElements = await this.fieldErrors.all();

    for (const error of errorElements) {
      const text = await this.getText(error, { timeout: 1000 });
      if (text.trim()) {
        errors.push(text.trim());
      }
    }

    return errors;
  }

  /**
   * Check if form has validation errors
   */
  async hasValidationErrors(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessages, 2000) ||
           await this.isElementVisible(this.fieldErrors, 2000);
  }

  /**
   * Check if form submission was successful
   */
  async isSubmissionSuccessful(): Promise<boolean> {
    return await this.isElementVisible(this.successMessages, 5000);
  }

  /**
   * Get success messages
   */
  async getSuccessMessages(): Promise<string[]> {
    const messages: string[] = [];
    const successElements = await this.successMessages.all();

    for (const success of successElements) {
      const text = await this.getText(success, { timeout: 1000 });
      if (text.trim()) {
        messages.push(text.trim());
      }
    }

    return messages;
  }

  /**
   * Wait for form to be valid
   */
  async waitForFormValid(timeout: number = 5000): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          const form = document.querySelector('form');
          return form ? form.checkValidity() : false;
        },
        {},
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  // ========================================
  // Form State and Progress
  // ========================================

  /**
   * Get progress percentage
   */
  async getProgressPercentage(): Promise<number> {
    try {
      const progressElement = this.progressBar;
      const ariaValueNow = await progressElement.getAttribute('aria-valuenow');
      if (ariaValueNow) return parseInt(ariaValueNow);

      const style = await progressElement.getAttribute('style');
      if (style && style.includes('width:')) {
        const widthMatch = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
        if (widthMatch) return parseFloat(widthMatch[1]);
      }

      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Check if form is loading
   */
  async isFormLoading(): Promise<boolean> {
    return await this.isElementVisible(this.loadingSpinner, 1000) ||
           await this.isElementVisible(this.submitLoader, 1000);
  }

  /**
   * Wait for form to stop loading
   */
  async waitForFormToStopLoading(timeout: number = 10000): Promise<void> {
    await this.waitForElementToBeHidden(this.loadingSpinner, timeout);
    await this.waitForElementToBeHidden(this.submitLoader, timeout);
  }

  /**
   * Get all form data
   */
  async getFormData(): Promise<{
    nationalId: string;
    birthDate: string;
    phoneNumber: string;
    startDate: string;
    rentalAmount: string;
    landlordConsent: boolean;
    termsConsent: boolean;
  }> {
    return {
      nationalId: await this.getNationalIdValue().catch(() => ''),
      birthDate: await this.getBirthDateValue().catch(() => ''),
      phoneNumber: await this.getPhoneNumberValue().catch(() => ''),
      startDate: await this.getStartDateValue().catch(() => ''),
      rentalAmount: await this.getYearlyRentalAmountValue().catch(() => ''),
      landlordConsent: await this.isLandlordContactConsentChecked().catch(() => false),
      termsConsent: await this.isTermsAndSimahConsentChecked().catch(() => false),
    };
  }

  /**
   * Clear all form data
   */
  async clearFormData(): Promise<void> {
    try {
      // Clear input fields that are visible
      const inputs = [
        this.nationalIdInput,
        this.birthDateInput,
        this.phoneNumberInput,
        this.otpInput,
        this.startDateInput,
        this.yearlyRentalAmountInput
      ];

      for (const input of inputs) {
        if (await this.isElementVisible(input, 1000)) {
          await input.clear();
        }
      }

      // Uncheck checkboxes that are visible and checked
      const checkboxes = [this.landlordContactConsent, this.termsAndSimahConsent];
      for (const checkbox of checkboxes) {
        if (await this.isElementVisible(checkbox, 1000) && await checkbox.isChecked()) {
          await this.uncheckCheckbox(checkbox);
        }
      }
    } catch (error) {
      this.logger.warn('Some form fields could not be cleared', { error: (error as Error).message });
    }
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Take screenshot of current step
   */
  async takeStepScreenshot(stepName?: string): Promise<string> {
    const currentStep = stepName || await this.getCurrentStep();
    return await this.takeScreenshot(`tenant-application-${currentStep}`);
  }

  /**
   * Refresh application page
   */
  async refreshApplicationPage(): Promise<void> {
    await this.reloadPage();
    await this.verifyPageLoaded();
  }

  /**
   * Check if required fields are filled
   */
  async areRequiredFieldsFilled(): Promise<boolean> {
    try {
      return await this.page.evaluate(() => {
        const requiredInputs = document.querySelectorAll('input[required], select[required]');
        return Array.from(requiredInputs).every(input => {
          const element = input as HTMLInputElement | HTMLSelectElement;
          return element.value.trim() !== '';
        });
      });
    } catch {
      return false;
    }
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if on tenant application page
   */
  isOnTenantApplicationPage(): boolean {
    return this.getCurrentUrl().includes('/tenant-application');
  }

  /**
   * Get page instance for test access
   */
  getPageForTesting(): Page {
    return this.page;
  }
}
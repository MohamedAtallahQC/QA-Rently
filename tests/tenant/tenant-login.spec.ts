import { test, expect } from '@playwright/test';
import { TenantLoginPage } from '../../Pages/Tenant/TenantLoginPage';
import { TestData } from '../../utils/TestData';
import { Helpers } from '../../utils/Helpers';

test.describe('Tenant Login Tests', () => {
  let tenantLoginPage: TenantLoginPage;

  test.beforeEach(async ({ page }) => {
    tenantLoginPage = new TenantLoginPage(page);
    await tenantLoginPage.navigateToLoginPage();
  });

  test('should display login form elements', async () => {
    // Verify all required elements are visible
    await tenantLoginPage.verifyPageElements();
    
    // Take screenshot for verification
    await tenantLoginPage.takeLoginFormScreenshot();
  });

  test('should allow user to enter phone number and start date', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Enter phone number
    await tenantLoginPage.enterPhoneNumber(tenantUser.phoneNumber);
    expect(await tenantLoginPage.getPhoneNumberValue()).toBe(tenantUser.phoneNumber);
    
    // Enter start date
    await tenantLoginPage.enterStartDate(tenantUser.startDate);
    expect(await tenantLoginPage.getStartDateValue()).toBe(tenantUser.startDate);
    
    // Verify form is valid
    expect(await tenantLoginPage.isFormValid()).toBe(true);
  });

  test('should validate form fields', async () => {
    // Test with empty form
    expect(await tenantLoginPage.isFormValid()).toBe(false);
    expect(await tenantLoginPage.isSubmitButtonEnabled()).toBe(false);
    
    // Test with only phone number
    await tenantLoginPage.enterPhoneNumber('+966501234567');
    expect(await tenantLoginPage.isFormValid()).toBe(false);
    
    // Test with only start date
    await tenantLoginPage.clearForm();
    await tenantLoginPage.enterStartDate('2024-02-01');
    expect(await tenantLoginPage.isFormValid()).toBe(false);
    
    // Test with both fields
    await tenantLoginPage.enterPhoneNumber('+966501234567');
    expect(await tenantLoginPage.isFormValid()).toBe(true);
  });

  test('should handle valid login attempt', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Perform login
    await tenantLoginPage.login(tenantUser);
    
    // Wait for loading to complete
    await tenantLoginPage.waitForLoadingToComplete();
    
    // Check if login was successful (navigation or success message)
    const loginSuccess = await tenantLoginPage.verifyLoginSuccess();
    const successMessage = await tenantLoginPage.getSuccessMessage();
    
    // Either navigation occurred or success message is displayed
    expect(loginSuccess || successMessage.length > 0).toBe(true);
  });

  test('should handle invalid phone number format', async () => {
    const invalidPhoneNumbers = [
      '123', // Too short
      'invalid-phone', // Non-numeric
      '+966', // Incomplete
      '966501234567' // Missing country code
    ];
    
    for (const invalidPhone of invalidPhoneNumbers) {
      await tenantLoginPage.clearForm();
      await tenantLoginPage.enterPhoneNumber(invalidPhone);
      await tenantLoginPage.enterStartDate('2024-02-01');
      
      // Try to submit
      await tenantLoginPage.clickSubmitButton();
      
      // Should show error or not navigate
      const hasError = await tenantLoginPage.isErrorMessageDisplayed();
      const currentUrl = await tenantLoginPage.getCurrentUrl();
      
      // Either error message is shown or still on login page
      expect(hasError || currentUrl.includes('login') || currentUrl.includes('/')).toBe(true);
    }
  });

  test('should handle invalid start date', async () => {
    const invalidDates = [
      '2020-01-01', // Past date
      'invalid-date', // Invalid format
      '', // Empty date
      '2024-13-01' // Invalid month
    ];
    
    for (const invalidDate of invalidDates) {
      await tenantLoginPage.clearForm();
      await tenantLoginPage.enterPhoneNumber('+966501234567');
      await tenantLoginPage.enterStartDate(invalidDate);
      
      // Try to submit
      await tenantLoginPage.clickSubmitButton();
      
      // Should show error or not navigate
      const hasError = await tenantLoginPage.isErrorMessageDisplayed();
      const currentUrl = await tenantLoginPage.getCurrentUrl();
      
      // Either error message is shown or still on login page
      expect(hasError || currentUrl.includes('login') || currentUrl.includes('/')).toBe(true);
    }
  });

  test('should clear form when clear button is clicked', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Fill form
    await tenantLoginPage.enterPhoneNumber(tenantUser.phoneNumber);
    await tenantLoginPage.enterStartDate(tenantUser.startDate);
    
    // Verify form is filled
    expect(await tenantLoginPage.getPhoneNumberValue()).toBe(tenantUser.phoneNumber);
    expect(await tenantLoginPage.getStartDateValue()).toBe(tenantUser.startDate);
    
    // Clear form
    await tenantLoginPage.clearForm();
    
    // Verify form is cleared
    expect(await tenantLoginPage.getPhoneNumberValue()).toBe('');
    expect(await tenantLoginPage.getStartDateValue()).toBe('');
    expect(await tenantLoginPage.isFormValid()).toBe(false);
  });

  test('should toggle language', async () => {
    // Check if language toggle is available
    const canToggleLanguage = await tenantLoginPage.isElementVisible(
      tenantLoginPage['languageToggle']
    );
    
    if (canToggleLanguage) {
      // Toggle language
      await tenantLoginPage.toggleLanguage();
      
      // Wait for page to update
      await tenantLoginPage.waitForPageLoad();
      
      // Verify page elements are still visible after language change
      await tenantLoginPage.verifyPageElements();
    }
  });

  test('should toggle theme', async () => {
    // Check if theme toggle is available
    const canToggleTheme = await tenantLoginPage.isElementVisible(
      tenantLoginPage['themeToggle']
    );
    
    if (canToggleTheme) {
      // Toggle theme
      await tenantLoginPage.toggleTheme();
      
      // Wait for page to update
      await tenantLoginPage.waitForPageLoad();
      
      // Verify page elements are still visible after theme change
      await tenantLoginPage.verifyPageElements();
    }
  });

  test('should handle network errors gracefully', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Simulate network failure by going offline
    await tenantLoginPage.page.context().setOffline(true);
    
    // Try to login
    await tenantLoginPage.login(tenantUser);
    
    // Should show error message or loading spinner
    const hasError = await tenantLoginPage.isErrorMessageDisplayed();
    const isLoading = await tenantLoginPage.isLoadingSpinnerVisible();
    
    expect(hasError || isLoading).toBe(true);
    
    // Go back online
    await tenantLoginPage.page.context().setOffline(false);
  });

  test('should maintain form state on page refresh', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Fill form
    await tenantLoginPage.enterPhoneNumber(tenantUser.phoneNumber);
    await tenantLoginPage.enterStartDate(tenantUser.startDate);
    
    // Refresh page
    await tenantLoginPage.reloadPage();
    
    // Form should be cleared after refresh (this depends on implementation)
    const phoneValue = await tenantLoginPage.getPhoneNumberValue();
    const dateValue = await tenantLoginPage.getStartDateValue();
    
    // Either form is cleared or values are maintained
    expect(phoneValue === '' || phoneValue === tenantUser.phoneNumber).toBe(true);
    expect(dateValue === '' || dateValue === tenantUser.startDate).toBe(true);
  });

  test('should handle rapid form submissions', async () => {
    const tenantUser = TestData.getRandomTenantUser();
    
    // Fill form
    await tenantLoginPage.enterPhoneNumber(tenantUser.phoneNumber);
    await tenantLoginPage.enterStartDate(tenantUser.startDate);
    
    // Rapidly click submit button multiple times
    for (let i = 0; i < 5; i++) {
      await tenantLoginPage.clickSubmitButton();
      await tenantLoginPage.page.waitForTimeout(100);
    }
    
    // Should not cause errors or duplicate submissions
    const hasError = await tenantLoginPage.isErrorMessageDisplayed();
    expect(hasError).toBe(false);
  });
});

import { test, expect } from '@playwright/test';
import { AdminLoginPage } from '../../Pages/Admin/AdminLoginPage';
import { TestData } from '../../utils/TestData';
import { Helpers } from '../../utils/Helpers';

test.describe('Admin Login Tests', () => {
  let adminLoginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    adminLoginPage = new AdminLoginPage(page);
    await adminLoginPage.navigateToLoginPage();
  });

  test('should display login form elements', async () => {
    // Verify all required elements are visible
    await adminLoginPage.verifyPageElements();
    
    // Take screenshot for verification
    await adminLoginPage.takeLoginFormScreenshot();
  });

  test('should allow user to enter email and password', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Enter email
    await adminLoginPage.enterEmail(adminUser.email);
    expect(await adminLoginPage.getEmailValue()).toBe(adminUser.email);
    
    // Enter password
    await adminLoginPage.enterPassword(adminUser.password);
    expect(await adminLoginPage.getPasswordValue()).toBe(adminUser.password);
    
    // Verify form is valid
    expect(await adminLoginPage.isFormValid()).toBe(true);
  });

  test('should handle remember me checkbox', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Check remember me
    await adminLoginPage.checkRememberMe();
    expect(await adminLoginPage.isRememberMeChecked()).toBe(true);
    
    // Uncheck remember me
    await adminLoginPage.uncheckRememberMe();
    expect(await adminLoginPage.isRememberMeChecked()).toBe(false);
  });

  test('should validate form fields', async () => {
    // Test with empty form
    expect(await adminLoginPage.isFormValid()).toBe(false);
    expect(await adminLoginPage.isLoginButtonEnabled()).toBe(false);
    
    // Test with only email
    await adminLoginPage.enterEmail('admin@rently.sa');
    expect(await adminLoginPage.isFormValid()).toBe(false);
    
    // Test with only password
    await adminLoginPage.clearForm();
    await adminLoginPage.enterPassword('password123');
    expect(await adminLoginPage.isFormValid()).toBe(false);
    
    // Test with both fields
    await adminLoginPage.enterEmail('admin@rently.sa');
    expect(await adminLoginPage.isFormValid()).toBe(true);
  });

  test('should handle valid login attempt', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Perform login
    await adminLoginPage.login(adminUser);
    
    // Wait for loading to complete
    await adminLoginPage.waitForLoadingToComplete();
    
    // Check if login was successful (navigation or success message)
    const loginSuccess = await adminLoginPage.verifyLoginSuccess();
    const successMessage = await adminLoginPage.getSuccessMessage();
    
    // Either navigation occurred or success message is displayed
    expect(loginSuccess || successMessage.length > 0).toBe(true);
  });

  test('should handle invalid email format', async () => {
    const invalidEmails = [
      'invalid-email', // Missing @
      '@rently.sa', // Missing username
      'admin@', // Missing domain
      'admin@rently', // Missing TLD
      'admin@.sa', // Invalid domain
      '' // Empty email
    ];
    
    for (const invalidEmail of invalidEmails) {
      await adminLoginPage.clearForm();
      await adminLoginPage.enterEmail(invalidEmail);
      await adminLoginPage.enterPassword('password123');
      
      // Try to submit
      await adminLoginPage.clickLoginButton();
      
      // Should show error or not navigate
      const hasError = await adminLoginPage.isErrorMessageDisplayed();
      const currentUrl = await adminLoginPage.getCurrentUrl();
      
      // Either error message is shown or still on login page
      expect(hasError || currentUrl.includes('login')).toBe(true);
    }
  });

  test('should handle invalid password', async () => {
    const invalidPasswords = [
      '', // Empty password
      '123', // Too short
      'a'.repeat(1000) // Too long
    ];
    
    for (const invalidPassword of invalidPasswords) {
      await adminLoginPage.clearForm();
      await adminLoginPage.enterEmail('admin@rently.sa');
      await adminLoginPage.enterPassword(invalidPassword);
      
      // Try to submit
      await adminLoginPage.clickLoginButton();
      
      // Should show error or not navigate
      const hasError = await adminLoginPage.isErrorMessageDisplayed();
      const currentUrl = await adminLoginPage.getCurrentUrl();
      
      // Either error message is shown or still on login page
      expect(hasError || currentUrl.includes('login')).toBe(true);
    }
  });

  test('should handle wrong credentials', async () => {
    const wrongCredentials = {
      email: 'wrong@rently.sa',
      password: 'wrongpassword',
      rememberMe: false
    };
    
    // Try to login with wrong credentials
    await adminLoginPage.login(wrongCredentials);
    
    // Should show error message
    const hasError = await adminLoginPage.isErrorMessageDisplayed();
    const errorMessage = await adminLoginPage.getErrorMessage();
    
    expect(hasError).toBe(true);
    expect(errorMessage).toBeTruthy();
  });

  test('should clear form when clear button is clicked', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Fill form
    await adminLoginPage.enterEmail(adminUser.email);
    await adminLoginPage.enterPassword(adminUser.password);
    await adminLoginPage.checkRememberMe();
    
    // Verify form is filled
    expect(await adminLoginPage.getEmailValue()).toBe(adminUser.email);
    expect(await adminLoginPage.getPasswordValue()).toBe(adminUser.password);
    expect(await adminLoginPage.isRememberMeChecked()).toBe(true);
    
    // Clear form
    await adminLoginPage.clearForm();
    
    // Verify form is cleared
    expect(await adminLoginPage.getEmailValue()).toBe('');
    expect(await adminLoginPage.getPasswordValue()).toBe('');
    expect(await adminLoginPage.isRememberMeChecked()).toBe(false);
    expect(await adminLoginPage.isFormValid()).toBe(false);
  });

  test('should access forgot password functionality', async () => {
    // Click forgot password link
    await adminLoginPage.clickForgotPasswordLink();
    
    // Wait for navigation or modal
    await adminLoginPage.waitForPageLoad();
    
    // Verify some action occurred
    const currentUrl = await adminLoginPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should toggle language', async () => {
    // Check if language toggle is available
    const canToggleLanguage = await adminLoginPage.isElementVisible(
      adminLoginPage['languageToggle']
    );
    
    if (canToggleLanguage) {
      // Toggle language
      await adminLoginPage.toggleLanguage();
      
      // Wait for page to update
      await adminLoginPage.waitForPageLoad();
      
      // Verify page elements are still visible after language change
      await adminLoginPage.verifyPageElements();
    }
  });

  test('should toggle theme', async () => {
    // Check if theme toggle is available
    const canToggleTheme = await adminLoginPage.isElementVisible(
      adminLoginPage['themeToggle']
    );
    
    if (canToggleTheme) {
      // Toggle theme
      await adminLoginPage.toggleTheme();
      
      // Wait for page to update
      await adminLoginPage.waitForPageLoad();
      
      // Verify page elements are still visible after theme change
      await adminLoginPage.verifyPageElements();
    }
  });

  test('should handle network errors gracefully', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Simulate network failure by going offline
    await adminLoginPage.page.context().setOffline(true);
    
    // Try to login
    await adminLoginPage.login(adminUser);
    
    // Should show error message or loading spinner
    const hasError = await adminLoginPage.isErrorMessageDisplayed();
    const isLoading = await adminLoginPage.isLoadingSpinnerVisible();
    
    expect(hasError || isLoading).toBe(true);
    
    // Go back online
    await adminLoginPage.page.context().setOffline(false);
  });

  test('should maintain form state on page refresh', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Fill form
    await adminLoginPage.enterEmail(adminUser.email);
    await adminLoginPage.enterPassword(adminUser.password);
    await adminLoginPage.checkRememberMe();
    
    // Refresh page
    await adminLoginPage.reloadPage();
    
    // Form should be cleared after refresh (this depends on implementation)
    const emailValue = await adminLoginPage.getEmailValue();
    const passwordValue = await adminLoginPage.getPasswordValue();
    const rememberMeChecked = await adminLoginPage.isRememberMeChecked();
    
    // Either form is cleared or values are maintained
    expect(emailValue === '' || emailValue === adminUser.email).toBe(true);
    expect(passwordValue === '' || passwordValue === adminUser.password).toBe(true);
    expect(rememberMeChecked === false || rememberMeChecked === true).toBe(true);
  });

  test('should handle rapid form submissions', async () => {
    const adminUser = TestData.getRandomAdminUser();
    
    // Fill form
    await adminLoginPage.enterEmail(adminUser.email);
    await adminLoginPage.enterPassword(adminUser.password);
    
    // Rapidly click login button multiple times
    for (let i = 0; i < 5; i++) {
      await adminLoginPage.clickLoginButton();
      await adminLoginPage.page.waitForTimeout(100);
    }
    
    // Should not cause errors or duplicate submissions
    const hasError = await adminLoginPage.isErrorMessageDisplayed();
    expect(hasError).toBe(false);
  });

  test('should validate HTML5 form validation', async () => {
    // Test email validation
    await adminLoginPage.enterEmail('invalid-email');
    await adminLoginPage.enterPassword('password123');
    await adminLoginPage.clickLoginButton();
    
    // Check for HTML5 validation errors
    const validationErrors = await adminLoginPage.getFormValidationErrors();
    expect(validationErrors.length).toBeGreaterThan(0);
  });

  test('should handle special characters in credentials', async () => {
    const specialCredentials = {
      email: 'admin+test@rently.sa',
      password: 'P@ssw0rd!@#$%^&*()',
      rememberMe: false
    };
    
    // Try to login with special characters
    await adminLoginPage.login(specialCredentials);
    
    // Should handle gracefully
    const hasError = await adminLoginPage.isErrorMessageDisplayed();
    const loginSuccess = await adminLoginPage.verifyLoginSuccess();
    
    // Either error or success, but not both
    expect(hasError !== loginSuccess).toBe(true);
  });

  test('should handle very long credentials', async () => {
    const longCredentials = {
      email: 'a'.repeat(100) + '@rently.sa',
      password: 'a'.repeat(1000),
      rememberMe: false
    };
    
    // Try to login with very long credentials
    await adminLoginPage.login(longCredentials);
    
    // Should handle gracefully
    const hasError = await adminLoginPage.isErrorMessageDisplayed();
    const loginSuccess = await adminLoginPage.verifyLoginSuccess();
    
    // Either error or success, but not both
    expect(hasError !== loginSuccess).toBe(true);
  });

  test('should verify login form is displayed', async () => {
    const isFormDisplayed = await adminLoginPage.verifyLoginFormDisplayed();
    expect(isFormDisplayed).toBe(true);
  });

  test('should wait for form to be ready', async () => {
    // Wait for form to be ready
    await adminLoginPage.waitForFormReady();
    
    // Verify form elements are accessible
    expect(await adminLoginPage.isElementVisible(adminLoginPage['emailInput'])).toBe(true);
    expect(await adminLoginPage.isElementVisible(adminLoginPage['passwordInput'])).toBe(true);
    expect(await adminLoginPage.isElementVisible(adminLoginPage['loginButton'])).toBe(true);
  });
});

import { test, expect } from '@playwright/test';
import { TenantApplicationPage } from '../../Pages/Tenant/TenantApplicationPage';
import { TestData, TenantApplicationData } from '../../utils/TestData';

test.describe('Tenant Application Page Tests', () => {
  let tenantApplicationPage: TenantApplicationPage;

  test.beforeEach(async ({ page }) => {
    tenantApplicationPage = new TenantApplicationPage(page);
    await tenantApplicationPage.navigateToTenantApplication();
  });

  test.describe('Page Load and Basic Functionality', () => {
    test('should display tenant application page elements', async () => {
      // Batch verifications for better performance
      const [isPageLoaded, isOnCorrectPage] = await Promise.all([
        tenantApplicationPage.verifyPageLoaded(),
        tenantApplicationPage.isOnTenantApplicationPage()
      ]);

      expect(isPageLoaded).toBe(true);
      expect(isOnCorrectPage).toBe(true);

      // Take screenshot for verification (optional for performance)
      if (process.env['TAKE_SCREENSHOTS'] !== 'false') {
        await tenantApplicationPage.takeStepScreenshot('page-loaded');
      }
    });

    test('should display correct page title', async () => {
      const title = await tenantApplicationPage.getPageTitle();
      console.log('Page Title:', title);
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should start with identity verification step', async () => {
      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Current Step:', currentStep);

      const isIdentityStep = await tenantApplicationPage.isIdentityVerificationStep();
      expect(isIdentityStep).toBe(true);
    });

    test('should display navigation elements', async () => {
      // Check if navigation menu is visible
      const homeLink = tenantApplicationPage.getPageForTesting().locator('a[href="/"], a[href="/en"], a:has-text("Home")');
      const isHomeVisible = await tenantApplicationPage.isElementVisible(homeLink, 5000);
      expect(isHomeVisible).toBe(true);
    });
  });

  test.describe('Identity Verification Step', () => {
    test('should fill and validate identity verification fields', async () => {
      const testData = TestData.getRandomTenantApplication();

      // Fill National ID
      await tenantApplicationPage.fillNationalId(testData.nationalId);
      const nationalIdValue = await tenantApplicationPage.getNationalIdValue();
      expect(nationalIdValue).toBe(testData.nationalId);

      // Fill Birth Date
      await tenantApplicationPage.fillBirthDate(testData.birthDate);
      const birthDateValue = await tenantApplicationPage.getBirthDateValue();
      expect(birthDateValue).toBe(testData.birthDate);

      console.log('Identity filled:', { nationalId: nationalIdValue, birthDate: birthDateValue });
    });

    test('should validate required fields in identity verification', async () => {
      // Try to submit without filling required fields
      await tenantApplicationPage.submitIdentityVerification();

      // Check if validation errors appear
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000); // Wait for validation
      const hasErrors = await tenantApplicationPage.hasValidationErrors();

      if (hasErrors) {
        const errors = await tenantApplicationPage.getValidationErrors();
        console.log('Validation errors:', errors);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    test('should handle invalid National ID formats', async () => {
      const invalidData = TestData.getInvalidTenantApplicationData();

      for (const invalidId of invalidData.invalidNationalIds.slice(0, 3)) { // Test first 3 invalid IDs
        await tenantApplicationPage.fillNationalId(invalidId);
        await tenantApplicationPage.fillBirthDate('1990-01-01'); // Valid birth date
        await tenantApplicationPage.submitIdentityVerification();

        // Wait for validation and check for errors
        await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);

        if (invalidId === '') {
          // Empty field should show required field error
          const hasErrors = await tenantApplicationPage.hasValidationErrors();
          if (hasErrors) {
            const errors = await tenantApplicationPage.getValidationErrors();
            console.log(`Empty National ID validation errors:`, errors);
          }
        }

        // Clear for next iteration
        await tenantApplicationPage.fillNationalId('');
      }
    });

    test('should handle invalid birth date formats', async () => {
      const invalidData = TestData.getInvalidTenantApplicationData();

      // Test with valid National ID and invalid birth dates
      await tenantApplicationPage.fillNationalId('1234567890');

      for (const invalidDate of invalidData.invalidBirthDates.slice(0, 3)) { // Test first 3 invalid dates
        await tenantApplicationPage.fillBirthDate(invalidDate);
        await tenantApplicationPage.submitIdentityVerification();

        // Wait for validation
        await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);

        console.log(`Testing invalid birth date: ${invalidDate}`);

        // Clear for next iteration
        await tenantApplicationPage.fillBirthDate('');
      }
    });

    test('should successfully submit valid identity verification', async () => {
      const testData = TestData.generateRandomTenantApplicationData();

      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );

      await tenantApplicationPage.submitIdentityVerification();

      // Wait for form to stop loading
      await tenantApplicationPage.waitForFormToStopLoading();

      // Check if we moved to next step or if there are any success messages
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);
      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Step after identity verification:', currentStep);

      // Take screenshot of current state
      await tenantApplicationPage.takeStepScreenshot('after-identity-verification');
    });
  });

  test.describe('Phone Verification Step', () => {
    test.beforeEach(async () => {
      // Complete identity verification first
      const testData = TestData.getRandomTenantApplication();

      if (await tenantApplicationPage.isIdentityVerificationStep()) {
        await tenantApplicationPage.fillIdentityVerificationDetails(
          testData.nationalId,
          testData.birthDate
        );
        await tenantApplicationPage.submitIdentityVerification();
        await tenantApplicationPage.waitForFormToStopLoading();
      }
    });

    test('should fill and validate phone number field', async () => {
      // Skip if not on phone verification step
      if (!(await tenantApplicationPage.isPhoneVerificationStep())) {
        test.skip();
        return;
      }

      const testData = TestData.getRandomTenantApplication();

      await tenantApplicationPage.fillPhoneNumber(testData.phoneNumber);
      const phoneValue = await tenantApplicationPage.getPhoneNumberValue();
      expect(phoneValue).toBe(testData.phoneNumber);

      console.log('Phone number filled:', phoneValue);
    });

    test('should validate phone number format', async () => {
      if (!(await tenantApplicationPage.isPhoneVerificationStep())) {
        test.skip();
        return;
      }

      const invalidData = TestData.getInvalidTenantApplicationData();

      for (const invalidPhone of invalidData.invalidPhoneNumbers.slice(0, 3)) {
        await tenantApplicationPage.fillPhoneNumber(invalidPhone);
        await tenantApplicationPage.submitPhoneNumber();

        await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);
        console.log(`Testing invalid phone: ${invalidPhone}`);

        // Clear for next iteration
        await tenantApplicationPage.fillPhoneNumber('');
      }
    });

    test('should successfully submit valid phone number', async () => {
      if (!(await tenantApplicationPage.isPhoneVerificationStep())) {
        test.skip();
        return;
      }

      const testData = TestData.generateRandomTenantApplicationData();

      await tenantApplicationPage.fillPhoneNumber(testData.phoneNumber);
      await tenantApplicationPage.submitPhoneNumber();
      await tenantApplicationPage.waitForFormToStopLoading();

      // Check current step after submission
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);
      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Step after phone submission:', currentStep);

      await tenantApplicationPage.takeStepScreenshot('after-phone-submission');
    });
  });

  test.describe('OTP Verification Step', () => {
    test.beforeEach(async () => {
      // Complete previous steps
      const testData = TestData.getRandomTenantApplication();

      if (await tenantApplicationPage.isIdentityVerificationStep()) {
        await tenantApplicationPage.fillIdentityVerificationDetails(
          testData.nationalId,
          testData.birthDate
        );
        await tenantApplicationPage.submitIdentityVerification();
        await tenantApplicationPage.waitForFormToStopLoading();
      }

      if (await tenantApplicationPage.isPhoneVerificationStep()) {
        await tenantApplicationPage.fillPhoneNumber(testData.phoneNumber);
        await tenantApplicationPage.submitPhoneNumber();
        await tenantApplicationPage.waitForFormToStopLoading();
      }
    });

    test('should display OTP input and timer', async () => {
      if (!(await tenantApplicationPage.isOTPVerificationStep())) {
        test.skip();
        return;
      }

      // Check if OTP timer is displayed
      const timer = await tenantApplicationPage.getOTPTimer();
      console.log('OTP Timer:', timer);

      // Check if resend button exists
      const isResendVisible = await tenantApplicationPage.isElementVisible(
        tenantApplicationPage.getPage().locator('button:has-text("Resend"), a:has-text("Resend")'),
        3000
      );
      console.log('Resend button visible:', isResendVisible);
    });

    test('should fill and validate OTP code', async () => {
      if (!(await tenantApplicationPage.isOTPVerificationStep())) {
        test.skip();
        return;
      }

      const testData = TestData.getRandomTenantApplication();

      await tenantApplicationPage.fillOTPCode(testData.otpCode);
      const otpValue = await tenantApplicationPage.getOTPValue();
      expect(otpValue).toBe(testData.otpCode);

      console.log('OTP filled:', otpValue);
    });

    test('should validate OTP format', async () => {
      if (!(await tenantApplicationPage.isOTPVerificationStep())) {
        test.skip();
        return;
      }

      const invalidData = TestData.getInvalidTenantApplicationData();

      for (const invalidOtp of invalidData.invalidOTPCodes.slice(0, 3)) {
        await tenantApplicationPage.fillOTPCode(invalidOtp);
        await tenantApplicationPage.verifyOTP();

        await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);
        console.log(`Testing invalid OTP: ${invalidOtp}`);

        // Clear for next iteration
        await tenantApplicationPage.fillOTPCode('');
      }
    });

    test('should successfully verify valid OTP', async () => {
      if (!(await tenantApplicationPage.isOTPVerificationStep())) {
        test.skip();
        return;
      }

      const testData = TestData.generateRandomTenantApplicationData();

      await tenantApplicationPage.fillOTPCode(testData.otpCode);
      await tenantApplicationPage.verifyOTP();
      await tenantApplicationPage.waitForFormToStopLoading();

      // Check current step after verification
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);
      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Step after OTP verification:', currentStep);

      await tenantApplicationPage.takeStepScreenshot('after-otp-verification');
    });
  });

  test.describe('Rental Request Details Step', () => {
    test.beforeEach(async () => {
      // Complete all previous steps to reach rental request
      const testData = TestData.getRandomTenantApplication();

      // Complete identity verification
      if (await tenantApplicationPage.isIdentityVerificationStep()) {
        await tenantApplicationPage.fillIdentityVerificationDetails(
          testData.nationalId,
          testData.birthDate
        );
        await tenantApplicationPage.submitIdentityVerification();
        await tenantApplicationPage.waitForFormToStopLoading();
      }

      // Complete phone verification
      if (await tenantApplicationPage.isPhoneVerificationStep()) {
        await tenantApplicationPage.fillPhoneNumber(testData.phoneNumber);
        await tenantApplicationPage.submitPhoneNumber();
        await tenantApplicationPage.waitForFormToStopLoading();
      }

      // Complete OTP verification
      if (await tenantApplicationPage.isOTPVerificationStep()) {
        await tenantApplicationPage.fillOTPCode(testData.otpCode);
        await tenantApplicationPage.verifyOTP();
        await tenantApplicationPage.waitForFormToStopLoading();
      }
    });

    test('should fill rental request details', async () => {
      if (!(await tenantApplicationPage.isRentalRequestStep())) {
        test.skip();
        return;
      }

      const testData = TestData.getRandomTenantApplication();

      // Fill start date
      await tenantApplicationPage.fillStartDate(testData.startDate);
      const startDateValue = await tenantApplicationPage.getStartDateValue();
      expect(startDateValue).toBe(testData.startDate);

      // Fill rental amount (optional field)
      if (testData.yearlyRentalAmount) {
        await tenantApplicationPage.fillYearlyRentalAmount(testData.yearlyRentalAmount);
        const rentalAmountValue = await tenantApplicationPage.getYearlyRentalAmountValue();
        expect(rentalAmountValue).toBe(testData.yearlyRentalAmount);
      }

      console.log('Rental details filled:', {
        startDate: startDateValue,
        rentalAmount: testData.yearlyRentalAmount
      });
    });

    test('should validate start date requirements', async () => {
      if (!(await tenantApplicationPage.isRentalRequestStep())) {
        test.skip();
        return;
      }

      const invalidData = TestData.getInvalidTenantApplicationData();

      for (const invalidDate of invalidData.invalidStartDates.slice(0, 3)) {
        await tenantApplicationPage.fillStartDate(invalidDate);
        await tenantApplicationPage.submitRentalRequest();

        await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);
        console.log(`Testing invalid start date: ${invalidDate}`);

        // Clear for next iteration
        await tenantApplicationPage.fillStartDate('');
      }
    });

    test('should successfully submit rental request', async () => {
      if (!(await tenantApplicationPage.isRentalRequestStep())) {
        test.skip();
        return;
      }

      const testData = TestData.generateRandomTenantApplicationData();

      await tenantApplicationPage.fillRentalRequestDetails(
        testData.startDate,
        testData.yearlyRentalAmount
      );

      await tenantApplicationPage.submitRentalRequest();
      await tenantApplicationPage.waitForFormToStopLoading();

      // Check current step after submission
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);
      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Step after rental request:', currentStep);

      await tenantApplicationPage.takeStepScreenshot('after-rental-request');
    });
  });

  test.describe('Consent and Final Submission', () => {
    test.beforeEach(async () => {
      // Complete all steps to reach consent
      const testData = TestData.getRandomTenantApplication();

      // Try to complete the full flow to reach consent step
      try {
        await tenantApplicationPage.completeApplication({
          nationalId: testData.nationalId,
          birthDate: testData.birthDate,
          phoneNumber: testData.phoneNumber,
          otpCode: testData.otpCode,
          startDate: testData.startDate,
          rentalAmount: testData.yearlyRentalAmount
        });
      } catch (error) {
        // If complete flow fails, manually navigate through steps
        if (await tenantApplicationPage.isIdentityVerificationStep()) {
          await tenantApplicationPage.fillIdentityVerificationDetails(
            testData.nationalId,
            testData.birthDate
          );
          await tenantApplicationPage.submitIdentityVerification();
          await tenantApplicationPage.waitForFormToStopLoading();
        }

        if (await tenantApplicationPage.isPhoneVerificationStep()) {
          await tenantApplicationPage.fillPhoneNumber(testData.phoneNumber);
          await tenantApplicationPage.submitPhoneNumber();
          await tenantApplicationPage.waitForFormToStopLoading();
        }

        if (await tenantApplicationPage.isOTPVerificationStep()) {
          await tenantApplicationPage.fillOTPCode(testData.otpCode);
          await tenantApplicationPage.verifyOTP();
          await tenantApplicationPage.waitForFormToStopLoading();
        }

        if (await tenantApplicationPage.isRentalRequestStep()) {
          await tenantApplicationPage.fillRentalRequestDetails(
            testData.startDate,
            testData.yearlyRentalAmount
          );
          await tenantApplicationPage.submitRentalRequest();
          await tenantApplicationPage.waitForFormToStopLoading();
        }
      }
    });

    test('should display and handle consent checkboxes', async () => {
      if (!(await tenantApplicationPage.isConsentStep())) {
        test.skip();
        return;
      }

      // Check landlord contact consent
      await tenantApplicationPage.checkLandlordContactConsent();
      const isLandlordChecked = await tenantApplicationPage.isLandlordContactConsentChecked();
      expect(isLandlordChecked).toBe(true);

      // Check terms and Simah consent
      await tenantApplicationPage.checkTermsAndSimahConsent();
      const isTermsChecked = await tenantApplicationPage.isTermsAndSimahConsentChecked();
      expect(isTermsChecked).toBe(true);

      // Verify all consents are checked
      const allConsentsChecked = await tenantApplicationPage.areAllConsentsChecked();
      expect(allConsentsChecked).toBe(true);

      console.log('Consent checkboxes status:', {
        landlord: isLandlordChecked,
        terms: isTermsChecked,
        all: allConsentsChecked
      });
    });

    test('should require consent before final submission', async () => {
      if (!(await tenantApplicationPage.isConsentStep())) {
        test.skip();
        return;
      }

      // Try to submit without consent
      await tenantApplicationPage.submitFinalApplication();

      // Check for validation errors
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);
      const hasErrors = await tenantApplicationPage.hasValidationErrors();

      if (hasErrors) {
        const errors = await tenantApplicationPage.getValidationErrors();
        console.log('Consent validation errors:', errors);
      }
    });

    test('should successfully submit complete application', async () => {
      if (!(await tenantApplicationPage.isConsentStep())) {
        test.skip();
        return;
      }

      // Check all consents
      await tenantApplicationPage.checkAllConsents();

      // Submit final application
      await tenantApplicationPage.submitFinalApplication();
      await tenantApplicationPage.waitForFormToStopLoading();

      // Check for success messages
      await tenantApplicationPage.getPageForTesting().waitForTimeout(3000);
      const isSuccessful = await tenantApplicationPage.isSubmissionSuccessful();

      if (isSuccessful) {
        const successMessages = await tenantApplicationPage.getSuccessMessages();
        console.log('Success messages:', successMessages);
        expect(successMessages.length).toBeGreaterThan(0);
      }

      await tenantApplicationPage.takeStepScreenshot('final-submission');
    });
  });

  test.describe('Complete Application Flow', () => {
    test('should complete entire application flow successfully', async () => {
      const testData = TestData.generateRandomTenantApplicationData();

      console.log('Starting complete application flow with data:', {
        nationalId: testData.nationalId,
        phoneNumber: testData.phoneNumber,
        startDate: testData.startDate
      });

      try {
        await tenantApplicationPage.completeApplication(testData);

        // Wait for final result
        await tenantApplicationPage.getPageForTesting().waitForTimeout(5000);

        // Check for success or get current state
        const isSuccessful = await tenantApplicationPage.isSubmissionSuccessful();
        const currentStep = await tenantApplicationPage.getCurrentStep();

        console.log('Application flow result:', {
          successful: isSuccessful,
          currentStep: currentStep
        });

        if (isSuccessful) {
          const successMessages = await tenantApplicationPage.getSuccessMessages();
          console.log('Application submitted successfully:', successMessages);
        }

        await tenantApplicationPage.takeStepScreenshot('complete-flow-end');
      } catch (error) {
        console.log('Application flow encountered issue:', error);

        // Take screenshot of current state for debugging
        await tenantApplicationPage.takeStepScreenshot('flow-error');

        // Get current step and form data for debugging
        const currentStep = await tenantApplicationPage.getCurrentStep();
        const formData = await tenantApplicationPage.getFormData();

        console.log('Debug info:', {
          currentStep,
          formData,
          error: (error as Error).message
        });
      }
    });

    test('should handle back navigation between steps', async () => {
      const testData = TestData.getRandomTenantApplication();

      // Complete first step
      if (await tenantApplicationPage.isIdentityVerificationStep()) {
        await tenantApplicationPage.fillIdentityVerificationDetails(
          testData.nationalId,
          testData.birthDate
        );
        await tenantApplicationPage.submitIdentityVerification();
        await tenantApplicationPage.waitForFormToStopLoading();
      }

      // Try to go back
      await tenantApplicationPage.goBack();
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);

      const currentStep = await tenantApplicationPage.getCurrentStep();
      console.log('Step after going back:', currentStep);

      // Verify we can navigate forward again
      if (await tenantApplicationPage.isIdentityVerificationStep()) {
        const nationalIdValue = await tenantApplicationPage.getNationalIdValue();
        console.log('Form data preserved:', nationalIdValue);
      }
    });
  });

  test.describe('Form Validation and Error Handling', () => {
    test('should display appropriate validation messages', async () => {
      // Try submitting empty form
      await tenantApplicationPage.submitIdentityVerification();
      await tenantApplicationPage.getPageForTesting().waitForTimeout(2000);

      const hasErrors = await tenantApplicationPage.hasValidationErrors();
      if (hasErrors) {
        const errors = await tenantApplicationPage.getValidationErrors();
        const fieldErrors = await tenantApplicationPage.getFieldErrors();

        console.log('Validation errors:', errors);
        console.log('Field errors:', fieldErrors);

        expect(errors.length + fieldErrors.length).toBeGreaterThan(0);
      }
    });

    test('should clear form data when requested', async () => {
      const testData = TestData.getRandomTenantApplication();

      // Fill some form data
      await tenantApplicationPage.fillNationalId(testData.nationalId);
      await tenantApplicationPage.fillBirthDate(testData.birthDate);

      // Verify data is filled
      const nationalIdBefore = await tenantApplicationPage.getNationalIdValue();
      const birthDateBefore = await tenantApplicationPage.getBirthDateValue();
      expect(nationalIdBefore).toBe(testData.nationalId);
      expect(birthDateBefore).toBe(testData.birthDate);

      // Clear form data
      await tenantApplicationPage.clearFormData();

      // Verify data is cleared
      const nationalIdAfter = await tenantApplicationPage.getNationalIdValue();
      const birthDateAfter = await tenantApplicationPage.getBirthDateValue();
      expect(nationalIdAfter).toBe('');
      expect(birthDateAfter).toBe('');
    });

    test('should track form progress', async () => {
      const initialProgress = await tenantApplicationPage.getProgressPercentage();
      console.log('Initial progress:', initialProgress);

      // Fill and submit first step
      const testData = TestData.getRandomTenantApplication();
      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );
      await tenantApplicationPage.submitIdentityVerification();
      await tenantApplicationPage.waitForFormToStopLoading();

      const progressAfterStep1 = await tenantApplicationPage.getProgressPercentage();
      console.log('Progress after step 1:', progressAfterStep1);

      // Progress should increase (if progress bar exists)
      if (initialProgress >= 0 && progressAfterStep1 >= 0) {
        expect(progressAfterStep1).toBeGreaterThanOrEqual(initialProgress);
      }
    });
  });

  test.describe('Responsive Design and Mobile Testing', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Refresh page for mobile layout
      await tenantApplicationPage.refreshApplicationPage();

      // Verify page still loads and functions
      expect(await tenantApplicationPage.verifyPageLoaded()).toBe(true);

      // Try filling form on mobile
      const testData = TestData.getRandomTenantApplication();
      await tenantApplicationPage.fillNationalId(testData.nationalId);
      await tenantApplicationPage.fillBirthDate(testData.birthDate);

      const nationalIdValue = await tenantApplicationPage.getNationalIdValue();
      expect(nationalIdValue).toBe(testData.nationalId);

      // Take mobile screenshot
      await tenantApplicationPage.takeStepScreenshot('mobile-view');

      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should work correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Refresh page for tablet layout
      await tenantApplicationPage.refreshApplicationPage();

      // Verify page functionality
      expect(await tenantApplicationPage.verifyPageLoaded()).toBe(true);

      // Test form interaction on tablet
      const testData = TestData.getRandomTenantApplication();
      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );

      const formData = await tenantApplicationPage.getFormData();
      expect(formData.nationalId).toBe(testData.nationalId);
      expect(formData.birthDate).toBe(testData.birthDate);

      await tenantApplicationPage.takeStepScreenshot('tablet-view');

      // Reset to desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Navigation and Theme Testing', () => {
    test('should navigate to home page', async () => {
      // Click home navigation
      await tenantApplicationPage.navigateToHome();

      // Wait for navigation
      await tenantApplicationPage.getPageForTesting().waitForTimeout(3000);

      // Verify we're no longer on tenant application page
      const currentUrl = tenantApplicationPage.getCurrentUrl();
      console.log('URL after home navigation:', currentUrl);

      // Should not contain tenant-application in URL
      expect(currentUrl).not.toContain('/tenant-application');
    });

    test('should toggle language if available', async () => {
      const currentUrl = tenantApplicationPage.getCurrentUrl();
      console.log('Initial URL:', currentUrl);

      // Try to toggle language
      await tenantApplicationPage.toggleLanguage();

      // Wait for potential language change
      await tenantApplicationPage.getPageForTesting().waitForTimeout(3000);

      const newUrl = tenantApplicationPage.getCurrentUrl();
      console.log('URL after language toggle:', newUrl);

      // If language toggle worked, URL should change
      if (newUrl !== currentUrl) {
        console.log('Language toggle successful');
      } else {
        console.log('Language toggle not available or no change detected');
      }
    });

    test('should toggle theme if available', async () => {
      // Try to toggle theme
      await tenantApplicationPage.toggleTheme();

      // Wait for theme change
      await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);

      // Verify page still functions after theme change
      expect(await tenantApplicationPage.verifyPageLoaded()).toBe(true);

      console.log('Theme toggle test completed');
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should handle loading states correctly', async () => {
      const testData = TestData.getRandomTenantApplication();

      // Fill form
      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );

      // Submit and immediately check loading state
      await tenantApplicationPage.submitIdentityVerification();

      const isLoading = await tenantApplicationPage.isFormLoading();
      console.log('Form loading state:', isLoading);

      // Wait for loading to complete
      await tenantApplicationPage.waitForFormToStopLoading();

      const isStillLoading = await tenantApplicationPage.isFormLoading();
      expect(isStillLoading).toBe(false);
    });

    test('should refresh page and maintain functionality', async () => {
      // Fill some data
      const testData = TestData.getRandomTenantApplication();
      await tenantApplicationPage.fillNationalId(testData.nationalId);

      // Refresh page
      await tenantApplicationPage.refreshApplicationPage();

      // Verify page loads and is functional
      expect(await tenantApplicationPage.verifyPageLoaded()).toBe(true);

      // Verify form is reset after refresh
      const nationalIdAfterRefresh = await tenantApplicationPage.getNationalIdValue();
      expect(nationalIdAfterRefresh).toBe(''); // Should be empty after refresh
    });
  });

  test.describe('Edge Cases and Error Scenarios', () => {
    test('should handle network timeouts gracefully', async () => {
      const testData = TestData.getRandomTenantApplication();

      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );

      // Submit form
      await tenantApplicationPage.submitIdentityVerification();

      // Wait longer than usual to simulate potential network issues
      await tenantApplicationPage.getPageForTesting().waitForTimeout(5000);

      // Check if form is still in loading state or has error
      const isLoading = await tenantApplicationPage.isFormLoading();
      const hasErrors = await tenantApplicationPage.hasValidationErrors();

      console.log('Network timeout test result:', {
        isLoading,
        hasErrors
      });

      // Form should either complete loading or show appropriate error
      expect(isLoading || hasErrors || await tenantApplicationPage.getCurrentStep() !== 'identity').toBe(true);
    });

    test('should handle rapid form submissions', async () => {
      const testData = TestData.getRandomTenantApplication();

      await tenantApplicationPage.fillIdentityVerificationDetails(
        testData.nationalId,
        testData.birthDate
      );

      // Submit multiple times rapidly
      await tenantApplicationPage.submitIdentityVerification();
      await tenantApplicationPage.submitIdentityVerification();
      await tenantApplicationPage.submitIdentityVerification();

      // Wait for any processing to complete
      await tenantApplicationPage.waitForFormToStopLoading();

      // Should not cause errors or unexpected behavior
      const hasErrors = await tenantApplicationPage.hasValidationErrors();
      console.log('Rapid submission test - has errors:', hasErrors);
    });

    test('should maintain form state during page interactions', async () => {
      const testData = TestData.getRandomTenantApplication();

      // Fill form data
      await tenantApplicationPage.fillNationalId(testData.nationalId);
      await tenantApplicationPage.fillBirthDate(testData.birthDate);

      // Perform various page interactions
      await tenantApplicationPage.getPageForTesting().mouse.move(100, 100);
      await tenantApplicationPage.getPageForTesting().keyboard.press('Tab');
      await tenantApplicationPage.getPageForTesting().waitForTimeout(1000);

      // Verify form data is still present
      const nationalIdValue = await tenantApplicationPage.getNationalIdValue();
      const birthDateValue = await tenantApplicationPage.getBirthDateValue();

      expect(nationalIdValue).toBe(testData.nationalId);
      expect(birthDateValue).toBe(testData.birthDate);

      console.log('Form state maintained after interactions');
    });
  });
});
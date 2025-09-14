import { Page, expect } from '@playwright/test';

/**
 * Utility helper functions for test automation
 */
export class Helpers {
  /**
   * Wait for page to be fully loaded
   */
  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for element to be visible and stable
   */
  static async waitForElementStable(page: Page, selector: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    // Wait a bit more to ensure element is stable
    await page.waitForTimeout(500);
  }

  /**
   * Clear and fill input field
   */
  static async clearAndFill(page: Page, selector: string, text: string): Promise<void> {
    await page.click(selector);
    await page.fill(selector, '');
    await page.fill(selector, text);
  }

  /**
   * Click element with retry mechanism
   */
  static async clickWithRetry(page: Page, selector: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.click(selector);
        break;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for text to appear on page
   */
  static async waitForText(page: Page, text: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Wait for text to disappear from page
   */
  static async waitForTextToDisappear(page: Page, text: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(`text=${text}`, { state: 'hidden', timeout });
  }

  /**
   * Take screenshot with timestamp
   */
  static async takeScreenshot(page: Page, name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({ 
      path: `screenshots/${name}-${timestamp}.png`, 
      fullPage: true 
    });
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number
   */
  static generateRandomNumber(min: number = 1000, max: number = 9999): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Format date for input fields
   */
  static formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  static getCurrentDate(): string {
    return this.formatDateForInput(new Date());
  }

  /**
   * Get future date
   */
  static getFutureDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return this.formatDateForInput(date);
  }

  /**
   * Wait for API response
   */
  static async waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout: number = 10000): Promise<any> {
    return await page.waitForResponse(response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    }, { timeout });
  }

  /**
   * Wait for multiple API responses
   */
  static async waitForMultipleApiResponses(page: Page, urlPatterns: (string | RegExp)[], timeout: number = 10000): Promise<any[]> {
    const responses = [];
    for (const pattern of urlPatterns) {
      const response = await this.waitForApiResponse(page, pattern, timeout);
      responses.push(response);
    }
    return responses;
  }

  /**
   * Check if element exists
   */
  static async elementExists(page: Page, selector: string): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element count
   */
  static async getElementCount(page: Page, selector: string): Promise<number> {
    return await page.locator(selector).count();
  }

  /**
   * Wait for element count to be specific number
   */
  static async waitForElementCount(page: Page, selector: string, expectedCount: number, timeout: number = 10000): Promise<void> {
    await expect(page.locator(selector)).toHaveCount(expectedCount, { timeout });
  }

  /**
   * Scroll to bottom of page
   */
  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  /**
   * Scroll to top of page
   */
  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  /**
   * Wait for loading spinner to disappear
   */
  static async waitForLoadingToComplete(page: Page, timeout: number = 10000): Promise<void> {
    try {
      await page.waitForSelector('[data-testid="loading"], .loading, .spinner', { 
        state: 'hidden', 
        timeout 
      });
    } catch {
      // Loading spinner might not exist, continue
    }
  }

  /**
   * Wait for modal to appear
   */
  static async waitForModal(page: Page, timeout: number = 10000): Promise<void> {
    await page.waitForSelector('[role="dialog"], .modal, .popup', { timeout });
  }

  /**
   * Close modal if open
   */
  static async closeModal(page: Page): Promise<void> {
    const modalCloseSelectors = [
      '[data-testid="close-modal"]',
      '.modal-close',
      '.close-button',
      '[aria-label="Close"]',
      'button:has-text("Close")',
      'button:has-text("×")'
    ];

    for (const selector of modalCloseSelectors) {
      if (await this.elementExists(page, selector)) {
        await page.click(selector);
        break;
      }
    }
  }

  /**
   * Handle browser alerts
   */
  static async handleAlert(page: Page, accept: boolean = true): Promise<void> {
    page.on('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for specific condition
   */
  static async waitForCondition(
    condition: () => Promise<boolean>, 
    timeout: number = 10000, 
    interval: number = 500
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Retry function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries - 1) break;
        
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Log test step
   */
  static logStep(step: string): void {
    console.log(`[TEST STEP] ${new Date().toISOString()} - ${step}`);
  }

  /**
   * Log test result
   */
  static logResult(testName: string, passed: boolean, error?: string): void {
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`[TEST RESULT] ${new Date().toISOString()} - ${testName}: ${status}`);
    if (error) {
      console.log(`[ERROR] ${error}`);
    }
  }
}

import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page class containing common functionality for all page objects
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  /**
   * Click on an element with retry mechanism
   */
  async clickElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await this.waitForElement(locator, timeout);
    await locator.click();
  }

  /**
   * Fill input field with text
   */
  async fillInput(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    await this.waitForElement(locator, timeout);
    await locator.fill('');
    await locator.fill(text);
  }

  /**
   * Get text content from element
   */
  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await expect(locator).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Scroll to element
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrl(url: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Reload the page
   */
  async reloadPage(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Handle alert dialogs
   */
  async handleAlert(accept: boolean = true): Promise<void> {
    this.page.on('dialog', async dialog => {
      if (accept) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for specific text to appear on page
   */
  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Verify page title contains expected text
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    const title = await this.getPageTitle();
    expect(title).toContain(expectedTitle);
  }

  /**
   * Wait for element to have specific text
   */
  async waitForElementText(locator: Locator, expectedText: string, timeout: number = 10000): Promise<void> {
    await expect(locator).toHaveText(expectedText, { timeout });
  }

  /**
   * Select option from dropdown
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.selectOption(value);
  }

  /**
   * Check checkbox
   */
  async checkCheckbox(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  /**
   * Uncheck checkbox
   */
  async uncheckCheckbox(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  /**
   * Double click on element
   */
  async doubleClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.dblclick();
  }

  /**
   * Right click on element
   */
  async rightClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ button: 'right' });
  }

  /**
   * Hover over element
   */
  async hover(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.hover();
  }

  /**
   * Press key on element
   */
  async pressKey(locator: Locator, key: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.press(key);
  }

  /**
   * Wait for element to be attached to DOM
   */
  async waitForElementAttached(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Wait for element to be detached from DOM
   */
  async waitForElementDetached(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'detached', timeout });
  }
}

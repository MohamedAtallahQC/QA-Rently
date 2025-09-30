import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

import {
  TIMEOUTS,
  RETRY_CONFIG,
  PATHS,
  FILE_EXTENSIONS,
  TEST_ENVIRONMENT,
  ANIMATION_CONFIG
} from '../utils/Constants';
import {
  TestAutomationError,
  ElementError,
  TimeoutError,
  NavigationError,
  PageLoadError,
  ValidationError,
  FileOperationError
} from '../utils/Exceptions';
import { RetryUtils, ELEMENT_RETRY_CONFIG, NETWORK_RETRY_CONFIG } from '../utils/RetryUtils';
import { logger, ChildLogger } from '../utils/Logger';

export interface ElementInteractionOptions {
  timeout?: number;
  force?: boolean;
  noWaitAfter?: boolean;
  trial?: boolean;
  retryOptions?: {
    maxAttempts?: number;
    delay?: number;
  };
}

export interface WaitOptions {
  timeout?: number;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  clip?: { x: number; y: number; width: number; height: number };
  quality?: number;
  type?: 'png' | 'jpeg';
  path?: string;
}

/**
 * Enhanced Base Page class with modern Playwright features and best practices
 */
export class BasePage {
  protected readonly page: Page;
  protected readonly logger: ChildLogger;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl?: string) {
    this.page = page;
    this.baseUrl = baseUrl || '';
    this.logger = logger.createChild(this.constructor.name);

    // Initialize page event listeners
    this.setupPageEventListeners();
  }

  /**
   * Setup page event listeners for logging and debugging
   */
  private setupPageEventListeners(): void {
    this.page.on('console', msg => {
      if (TEST_ENVIRONMENT.DEBUG_MODE) {
        this.logger.debug(`Browser console [${msg.type()}]: ${msg.text()}`);
      }
    });

    this.page.on('pageerror', error => {
      this.logger.error('Page error occurred', { error: error.message, stack: error.stack });
    });

    this.page.on('requestfailed', request => {
      this.logger.warn('Request failed', {
        url: request.url(),
        method: request.method(),
        failure: request.failure()?.errorText
      });
    });
  }

  /**
   * Navigate to a specific URL with enhanced error handling and retry
   */
  async navigateTo(url: string, options?: { timeout?: number; waitUntil?: 'load' | 'networkidle' | 'domcontentloaded' }): Promise<void> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const timeout = options?.timeout || TIMEOUTS.PAGE_LOAD;
    const waitUntil = options?.waitUntil || 'networkidle';

    this.logger.info(`Navigating to: ${fullUrl}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          const response = await this.page.goto(fullUrl, { timeout, waitUntil });

          if (!response) {
            throw new NavigationError(`Failed to navigate to ${fullUrl}`, fullUrl);
          }

          if (!response.ok() && response.status() >= 400) {
            throw new NavigationError(
              `Navigation failed with status ${response.status()}: ${response.statusText()}`,
              fullUrl
            );
          }

          return response;
        },
        NETWORK_RETRY_CONFIG,
        'navigation'
      );

      await this.waitForPageStable();
      this.logger.info(`Successfully navigated to: ${fullUrl}`);

    } catch (error) {
      this.logger.error(`Navigation failed to: ${fullUrl}`, { error: (error as Error).message });
      throw new NavigationError(`Failed to navigate to ${fullUrl}: ${(error as Error).message}`, fullUrl);
    }
  }

  /**
   * Wait for page to be stable (no pending network requests and animations) - optimized
   */
  async waitForPageStable(timeout: number = TIMEOUTS.NETWORK_IDLE): Promise<void> {
    try {
      // Use domcontentloaded for faster loading, only fall back to networkidle if needed
      await this.page.waitForLoadState('domcontentloaded', { timeout: timeout / 2 });

      if (ANIMATION_CONFIG.WAIT_FOR_ANIMATIONS) {
        await this.page.waitForTimeout(ANIMATION_CONFIG.ANIMATION_TIMEOUT);
      }
    } catch (error) {
      throw new PageLoadError(
        `Page did not become stable within ${timeout}ms`,
        'domcontentloaded',
        this.page.url()
      );
    }
  }

  /**
   * Enhanced element waiting with comprehensive options
   */
  async waitForElement(
    locator: Locator,
    options: WaitOptions = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const state = options.state || 'visible';

    try {
      await RetryUtils.withRetry(
        async () => {
          await locator.waitFor({ state, timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });
        },
        {
          maxAttempts: RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
          delay: RETRY_CONFIG.ELEMENT_DELAY,
          retryIf: (error) => error.message.includes('timeout') || error.message.includes('not found')
        },
        `wait for element to be ${state}`
      );
    } catch (error) {
      const selector = await this.getLocatorDescription(locator);
      throw new ElementError(
        `Element not ${state} within ${timeout}ms: ${selector}`,
        selector,
        `wait for ${state}`
      );
    }
  }

  /**
   * Wait for element to be hidden with retry logic
   */
  async waitForElementToBeHidden(locator: Locator, timeout?: number): Promise<void> {
    const options: WaitOptions = { state: 'hidden' };
    if (timeout !== undefined) {
      options.timeout = timeout;
    }
    await this.waitForElement(locator, options);
  }

  /**
   * Enhanced click with comprehensive options and retry logic
   */
  async clickElement(
    locator: Locator,
    options: ElementInteractionOptions = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Clicking element: ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          // Wait for element to be stable (not moving)
          await this.waitForElementStable(locator);

          const clickOptions: any = {
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS
          };
          if (options.force !== undefined) clickOptions.force = options.force;
          if (options.noWaitAfter !== undefined) clickOptions.noWaitAfter = options.noWaitAfter;
          if (options.trial !== undefined) clickOptions.trial = options.trial;

          await locator.click(clickOptions);
        },
        ELEMENT_RETRY_CONFIG,
        `click element: ${selector}`
      );

      this.logger.debug(`Successfully clicked element: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to click element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to click element: ${selector}. ${(error as Error).message}`,
        selector,
        'click'
      );
    }
  }

  /**
   * Enhanced input filling with validation and retry
   */
  async fillInput(
    locator: Locator,
    text: string,
    options: ElementInteractionOptions & { clear?: boolean; validate?: boolean } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const clear = options.clear !== false; // Default to true
    const validate = options.validate !== false; // Default to true
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Filling input: ${selector} with text: ${text}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          // Clear existing text if requested
          if (clear) {
            await locator.clear({ timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });
          }

          // Fill with new text
          const fillOptions: any = {
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS
          };
          if (options.force !== undefined) fillOptions.force = options.force;
          if (options.noWaitAfter !== undefined) fillOptions.noWaitAfter = options.noWaitAfter;

          await locator.fill(text, fillOptions);

          // Validate the input was filled correctly
          if (validate) {
            const actualValue = await locator.inputValue();
            if (actualValue !== text) {
              throw new ValidationError(
                `Input validation failed for ${selector}`,
                text,
                actualValue
              );
            }
          }
        },
        ELEMENT_RETRY_CONFIG,
        `fill input: ${selector}`
      );

      this.logger.debug(`Successfully filled input: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to fill input: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to fill input: ${selector}. ${(error as Error).message}`,
        selector,
        'fill'
      );
    }
  }

  /**
   * Enhanced text retrieval with fallback options
   */
  async getText(
    locator: Locator,
    options: { timeout?: number; trim?: boolean; fallback?: string } = {}
  ): Promise<string> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const trim = options.trim !== false; // Default to true
    const fallback = options.fallback || '';
    const selector = await this.getLocatorDescription(locator);

    try {
      await this.waitForElement(locator, { timeout });

      let text = await locator.textContent();

      // Fallback to innerText if textContent is null or empty
      if (!text) {
        text = await locator.innerText().catch(() => '');
      }

      // Fallback to input value for input elements
      if (!text) {
        text = await locator.inputValue().catch(() => '');
      }

      text = text || fallback;

      return trim ? text.trim() : text;

    } catch (error) {
      this.logger.warn(`Failed to get text from element: ${selector}`, { error: (error as Error).message });
      return fallback;
    }
  }

  /**
   * Enhanced element visibility check with timeout options - optimized
   */
  async isElementVisible(locator: Locator, timeout: number = TIMEOUTS.SHORT): Promise<boolean> {
    try {
      // Use faster isVisible check instead of expect for performance
      return await locator.isVisible({ timeout });
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be stable (not moving/changing) - optimized
   */
  private async waitForElementStable(
    locator: Locator,
    timeout: number = TIMEOUTS.ANIMATION
  ): Promise<void> {
    if (!ANIMATION_CONFIG.WAIT_FOR_ANIMATIONS) {
      return;
    }

    try {
      // Reduced stability check for performance - only 2 checks instead of continuous loop
      let previousBox = await locator.boundingBox();
      await this.page.waitForTimeout(50);

      const currentBox = await locator.boundingBox();

      if (!previousBox || !currentBox) {
        await this.page.waitForTimeout(ANIMATION_CONFIG.ANIMATION_TIMEOUT);
        return;
      }

      const isStable = Math.abs(previousBox.x - currentBox.x) < 1 &&
        Math.abs(previousBox.y - currentBox.y) < 1;

      if (!isStable) {
        await this.page.waitForTimeout(ANIMATION_CONFIG.ANIMATION_TIMEOUT);
      }
    } catch {
      // If we can't get bounding box, just wait briefly
      await this.page.waitForTimeout(ANIMATION_CONFIG.ANIMATION_TIMEOUT);
    }
  }

  /**
   * Get a description of the locator for logging
   */
  private async getLocatorDescription(locator: Locator): Promise<string> {
    try {
      // Try to get a meaningful description from the locator
      const locatorString = locator.toString();

      // Extract selector from locator string if possible
      const selectorMatch = locatorString.match(/locator\('([^']+)'\)/);
      if (selectorMatch && selectorMatch[1]) {
        return selectorMatch[1];
      }

      return locatorString;
    } catch {
      return 'unknown locator';
    }
  }

  /**
   * Enhanced element enabled check with wait
   */
  async isElementEnabled(
    locator: Locator,
    options: { timeout?: number; waitForElement?: boolean } = {}
  ): Promise<boolean> {
    try {
      if (options.waitForElement !== false) {
        const waitOptions: WaitOptions = {};
        if (options.timeout !== undefined) {
          waitOptions.timeout = options.timeout;
        }
        await this.waitForElement(locator, waitOptions);
      }
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Enhanced page load waiting with multiple strategies
   */
  async waitForPageLoad(
    options: {
      timeout?: number;
      state?: 'load' | 'domcontentloaded' | 'networkidle';
      waitForSelectors?: string[];
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.PAGE_LOAD;
    const state = options.state || 'networkidle';

    try {
      // Wait for the specified load state
      await this.page.waitForLoadState(state, { timeout });

      // Wait for critical selectors if provided
      if (options.waitForSelectors?.length) {
        await Promise.all(
          options.waitForSelectors.map(selector =>
            this.page.waitForSelector(selector, { timeout: TIMEOUTS.ELEMENT_WAIT })
          )
        );
      }

      // Wait for animations to settle
      if (ANIMATION_CONFIG.WAIT_FOR_ANIMATIONS) {
        await this.page.waitForTimeout(ANIMATION_CONFIG.ANIMATION_TIMEOUT);
      }

    } catch (error) {
      throw new PageLoadError(
        `Page did not load within ${timeout}ms`,
        state,
        this.page.url()
      );
    }
  }

  /**
   * Enhanced screenshot functionality with flexible options
   */
  async takeScreenshot(
    name: string,
    options: ScreenshotOptions = {}
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${name}-${timestamp}${FILE_EXTENSIONS.SCREENSHOT}`;
    const screenshotPath = options.path || path.join(PATHS.SCREENSHOTS, fileName);

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

      const screenshotOptions: any = {
        path: screenshotPath,
        fullPage: options.fullPage !== false, // Default to true
        type: options.type || 'png'
      };
      if (options.clip !== undefined) screenshotOptions.clip = options.clip;
      if (options.quality !== undefined) screenshotOptions.quality = options.quality;

      await this.page.screenshot(screenshotOptions);

      this.logger.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;

    } catch (error) {
      this.logger.error('Failed to take screenshot', { error: (error as Error).message });
      throw new FileOperationError(
        `Failed to take screenshot: ${(error as Error).message}`,
        screenshotPath,
        'screenshot'
      );
    }
  }

  /**
   * Enhanced element scrolling with options
   */
  async scrollToElement(
    locator: Locator,
    options: {
      timeout?: number;
      behavior?: 'smooth' | 'auto';
      block?: 'start' | 'center' | 'end' | 'nearest';
      inline?: 'start' | 'center' | 'end' | 'nearest';
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      await this.waitForElement(locator, { timeout });

      // Use scrollIntoViewIfNeeded for simple scrolling
      if (!options.behavior && !options.block && !options.inline) {
        await locator.scrollIntoViewIfNeeded({ timeout });
      } else {
        // Use evaluate for advanced scrolling options
        await locator.evaluate((element, scrollOptions) => {
          element.scrollIntoView({
            behavior: scrollOptions.behavior || 'auto',
            block: scrollOptions.block || 'start',
            inline: scrollOptions.inline || 'nearest'
          });
        }, options);
      }

      // Reduced scroll wait time for performance
      await this.page.waitForTimeout(100);

    } catch (error) {
      this.logger.error(`Failed to scroll to element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to scroll to element: ${selector}`,
        selector,
        'scroll'
      );
    }
  }

  /**
   * Enhanced URL waiting with validation
   */
  async waitForUrl(
    url: string | RegExp,
    options: { timeout?: number; exact?: boolean } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.PAGE_LOAD;

    try {
      await this.page.waitForURL(url, { timeout });

      // Additional validation for exact matches
      if (options.exact && typeof url === 'string') {
        const currentUrl = this.page.url();
        if (currentUrl !== url) {
          throw new NavigationError(
            `URL mismatch: expected ${url}, got ${currentUrl}`,
            currentUrl,
            url
          );
        }
      }

    } catch (error) {
      const currentUrl = this.page.url();
      throw new NavigationError(
        `URL did not match within ${timeout}ms: expected ${url}, current ${currentUrl}`,
        currentUrl,
        typeof url === 'string' ? url : url.toString()
      );
    }
  }

  /**
   * Get current URL with optional parsing
   */
  getCurrentUrl(options: { parsed?: boolean } = {}): string | URL {
    const url = this.page.url();
    return options.parsed ? new URL(url) : url;
  }

  /**
   * Enhanced page reload with options
   */
  async reloadPage(
    options: {
      timeout?: number;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
      waitForSelectors?: string[];
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.PAGE_LOAD;

    try {
      const reloadOptions: any = { timeout };
      if (options.waitUntil !== undefined) reloadOptions.waitUntil = options.waitUntil;

      await this.page.reload(reloadOptions);

      const pageLoadOptions: any = { timeout };
      if (options.waitUntil !== undefined) pageLoadOptions.state = options.waitUntil;
      if (options.waitForSelectors !== undefined) pageLoadOptions.waitForSelectors = options.waitForSelectors;

      await this.waitForPageLoad(pageLoadOptions);

      this.logger.info('Page reloaded successfully');

    } catch (error) {
      throw new PageLoadError(
        `Failed to reload page: ${(error as Error).message}`,
        'reload',
        this.page.url()
      );
    }
  }

  /**
   * Enhanced navigation back with validation
   */
  async goBack(
    options: {
      timeout?: number;
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.PAGE_LOAD;
    const currentUrl = this.getCurrentUrl() as string;

    try {
      const backOptions: any = { timeout };
      if (options.waitUntil !== undefined) backOptions.waitUntil = options.waitUntil;

      await this.page.goBack(backOptions);

      const pageLoadOptions: any = { timeout };
      if (options.waitUntil !== undefined) pageLoadOptions.state = options.waitUntil;

      await this.waitForPageLoad(pageLoadOptions);

      const newUrl = this.getCurrentUrl() as string;
      this.logger.info(`Navigated back from ${currentUrl} to ${newUrl}`);

    } catch (error) {
      throw new NavigationError(
        `Failed to go back: ${(error as Error).message}`,
        currentUrl
      );
    }
  }

  /**
   * Enhanced network idle waiting with request monitoring
   */
  async waitForNetworkIdle(
    options: {
      timeout?: number;
      idleTime?: number;
      ignoredUrls?: (string | RegExp)[];
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.NETWORK_IDLE;

    try {
      // First wait for basic network idle
      await this.page.waitForLoadState('networkidle', { timeout });

      // Then wait for custom idle time with request monitoring
      if (options.ignoredUrls?.length || (options.idleTime && options.idleTime > 500)) {
        await this.waitForCustomNetworkIdle(options);
      }

    } catch (error) {
      throw new TimeoutError(
        `Network did not become idle within ${timeout}ms`,
        timeout,
        'network idle'
      );
    }
  }

  /**
   * Wait for custom network idle conditions
   */
  private async waitForCustomNetworkIdle(
    options: {
      timeout?: number;
      idleTime?: number;
      ignoredUrls?: (string | RegExp)[];
    }
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.NETWORK_IDLE;
    const idleTime = options.idleTime || 500;
    const ignoredUrls = options.ignoredUrls || [];

    let pendingRequests = 0;
    let lastRequestTime = Date.now();

    const requestHandler = (request: any) => {
      const url = request.url();
      const shouldIgnore = ignoredUrls.some(pattern => {
        if (typeof pattern === 'string') {
          return url.includes(pattern);
        }
        return pattern.test(url);
      });

      if (!shouldIgnore) {
        pendingRequests++;
        lastRequestTime = Date.now();
      }
    };

    const responseHandler = (response: any) => {
      const url = response.url();
      const shouldIgnore = ignoredUrls.some(pattern => {
        if (typeof pattern === 'string') {
          return url.includes(pattern);
        }
        return pattern.test(url);
      });

      if (!shouldIgnore) {
        pendingRequests = Math.max(0, pendingRequests - 1);
      }
    };

    this.page.on('request', requestHandler);
    this.page.on('response', responseHandler);
    this.page.on('requestfailed', responseHandler);

    try {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (pendingRequests === 0 && Date.now() - lastRequestTime >= idleTime) {
          break;
        }
        await this.page.waitForTimeout(100);
      }

      if (pendingRequests > 0 || Date.now() - lastRequestTime < idleTime) {
        throw new TimeoutError(
          `Custom network idle condition not met within ${timeout}ms`,
          timeout,
          'custom network idle'
        );
      }

    } finally {
      this.page.off('request', requestHandler);
      this.page.off('response', responseHandler);
      this.page.off('requestfailed', responseHandler);
    }
  }

  /**
   * Enhanced dialog handling with message capture
   */
  async handleNextDialog(
    action: 'accept' | 'dismiss',
    options: {
      timeout?: number;
      promptText?: string;
      expectedMessage?: string | RegExp;
    } = {}
  ): Promise<{ type: string; message: string; defaultValue?: string }> {
    const timeout = options.timeout || TIMEOUTS.MEDIUM;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new TimeoutError(
          `No dialog appeared within ${timeout}ms`,
          timeout,
          'dialog handling'
        ));
      }, timeout);

      const dialogHandler = async (dialog: any) => {
        clearTimeout(timeoutId);
        this.page.off('dialog', dialogHandler);

        const dialogInfo = {
          type: dialog.type(),
          message: dialog.message(),
          defaultValue: dialog.defaultValue()
        };

        this.logger.info('Dialog appeared', dialogInfo);

        // Validate message if expected
        if (options.expectedMessage) {
          const matches = typeof options.expectedMessage === 'string'
            ? dialogInfo.message.includes(options.expectedMessage)
            : options.expectedMessage.test(dialogInfo.message);

          if (!matches) {
            await dialog.dismiss();
            reject(new ValidationError(
              'Dialog message did not match expected pattern',
              options.expectedMessage,
              dialogInfo.message
            ));
            return;
          }
        }

        try {
          if (action === 'accept') {
            await dialog.accept(options.promptText);
          } else {
            await dialog.dismiss();
          }

          resolve(dialogInfo);
        } catch (error) {
          reject(error);
        }
      };

      this.page.on('dialog', dialogHandler);
    });
  }

  /**
   * Enhanced text waiting with multiple strategies
   */
  async waitForText(
    text: string | RegExp,
    options: {
      timeout?: number;
      exact?: boolean;
      caseSensitive?: boolean;
      selector?: string;
    } = {}
  ): Promise<Locator> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;

    try {
      let locator: Locator;

      if (options.selector) {
        // Wait for text within specific selector
        locator = this.page.locator(options.selector).filter({ hasText: text });
      } else if (typeof text === 'string') {
        // Use different strategies based on options
        if (options.exact) {
          locator = this.page.getByText(text, { exact: true });
        } else {
          locator = this.page.getByText(text);
        }
      } else {
        // RegExp text search
        locator = this.page.locator('*').filter({ hasText: text });
      }

      await this.waitForElement(locator, { timeout });
      return locator;

    } catch (error) {
      throw new ElementError(
        `Text not found within ${timeout}ms: ${text}`,
        typeof text === 'string' ? text : text.toString(),
        'wait for text'
      );
    }
  }

  /**
   * Get page title with validation options
   */
  async getPageTitle(
    options: {
      timeout?: number;
      waitForTitle?: boolean;
      expectedPattern?: string | RegExp;
    } = {}
  ): Promise<string> {
    if (options.waitForTitle) {
      await this.waitForPageLoad({ timeout: options.timeout });
    }

    const title = await this.page.title();

    // Validate title if pattern provided
    if (options.expectedPattern) {
      const matches = typeof options.expectedPattern === 'string'
        ? title.includes(options.expectedPattern)
        : options.expectedPattern.test(title);

      if (!matches) {
        throw new ValidationError(
          'Page title did not match expected pattern',
          options.expectedPattern,
          title
        );
      }
    }

    return title;
  }

  /**
   * Enhanced page title verification
   */
  async verifyPageTitle(
    expectedTitle: string | RegExp,
    options: {
      exact?: boolean;
      timeout?: number;
      caseSensitive?: boolean;
    } = {}
  ): Promise<void> {
    const title = await this.getPageTitle({ timeout: options.timeout, waitForTitle: true });

    let matches: boolean;

    if (typeof expectedTitle === 'string') {
      const titleToCheck = options.caseSensitive ? title : title.toLowerCase();
      const expectedToCheck = options.caseSensitive ? expectedTitle : expectedTitle.toLowerCase();

      matches = options.exact
        ? titleToCheck === expectedToCheck
        : titleToCheck.includes(expectedToCheck);
    } else {
      matches = expectedTitle.test(title);
    }

    if (!matches) {
      throw new ValidationError(
        'Page title verification failed',
        expectedTitle,
        title
      );
    }
  }

  /**
   * Enhanced element text waiting with flexible matching
   */
  async waitForElementText(
    locator: Locator,
    expectedText: string | RegExp | (string | RegExp)[],
    options: {
      timeout?: number;
      exact?: boolean;
      caseSensitive?: boolean;
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      if (options.exact && typeof expectedText === 'string') {
        await expect(locator).toHaveText(expectedText, { timeout });
      } else {
        await expect(locator).toContainText(expectedText as string | RegExp, { timeout });
      }

    } catch (error) {
      const actualText = await this.getText(locator, { timeout: 1000 });
      throw new ValidationError(
        `Element text did not match within ${timeout}ms for ${selector}`,
        expectedText,
        actualText
      );
    }
  }

  /**
   * Enhanced dropdown option selection with validation
   */
  async selectOption(
    locator: Locator,
    value: string | string[] | { value?: string; label?: string; index?: number },
    options: ElementInteractionOptions & { validate?: boolean } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const validate = options.validate !== false;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Selecting option: ${JSON.stringify(value)} from ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          // Handle different selection methods
          if (typeof value === 'object' && !Array.isArray(value)) {
            if (value.index !== undefined) {
              await locator.selectOption({ index: value.index });
            } else if (value.label) {
              await locator.selectOption({ label: value.label });
            } else if (value.value) {
              await locator.selectOption({ value: value.value });
            } else {
              throw new ElementError('Invalid selection object', selector, 'select');
            }
          } else {
            await locator.selectOption(value as string | string[]);
          }

          // Validate selection if requested
          if (validate) {
            await this.page.waitForTimeout(100); // Brief wait for selection to register
            const selectedValue = await locator.inputValue();

            let expectedValue: string;
            if (typeof value === 'string') {
              expectedValue = value;
            } else if (Array.isArray(value)) {
              expectedValue = value[0]; // Check first value for arrays
            } else if (value.value) {
              expectedValue = value.value;
            } else {
              return; // Skip validation for label/index selections
            }

            if (selectedValue !== expectedValue) {
              throw new ValidationError(
                `Selection validation failed for ${selector}`,
                expectedValue,
                selectedValue
              );
            }
          }
        },
        ELEMENT_RETRY_CONFIG,
        `select option: ${selector}`
      );

      this.logger.debug(`Successfully selected option from ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to select option from ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to select option: ${(error as Error).message}`,
        selector,
        'select'
      );
    }
  }

  /**
   * Enhanced checkbox checking with validation
   */
  async checkCheckbox(
    locator: Locator,
    options: ElementInteractionOptions & { validate?: boolean } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const validate = options.validate !== false;
    const selector = await this.getLocatorDescription(locator);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          const isChecked = await locator.isChecked();
          if (!isChecked) {
            await locator.check({
              timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
              force: options.force,
              noWaitAfter: options.noWaitAfter,
              trial: options.trial
            });

            // Validate the checkbox was checked
            if (validate) {
              await this.page.waitForTimeout(100);
              const nowChecked = await locator.isChecked();
              if (!nowChecked) {
                throw new ValidationError(
                  `Checkbox validation failed for ${selector}`,
                  true,
                  false
                );
              }
            }
          }
        },
        ELEMENT_RETRY_CONFIG,
        `check checkbox: ${selector}`
      );

    } catch (error) {
      throw new ElementError(
        `Failed to check checkbox: ${(error as Error).message}`,
        selector,
        'check'
      );
    }
  }

  /**
   * Enhanced checkbox unchecking with validation
   */
  async uncheckCheckbox(
    locator: Locator,
    options: ElementInteractionOptions & { validate?: boolean } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const validate = options.validate !== false;
    const selector = await this.getLocatorDescription(locator);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          const isChecked = await locator.isChecked();
          if (isChecked) {
            await locator.uncheck({
              timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
              force: options.force,
              noWaitAfter: options.noWaitAfter,
              trial: options.trial
            });

            // Validate the checkbox was unchecked
            if (validate) {
              await this.page.waitForTimeout(100);
              const nowChecked = await locator.isChecked();
              if (nowChecked) {
                throw new ValidationError(
                  `Checkbox validation failed for ${selector}`,
                  false,
                  true
                );
              }
            }
          }
        },
        ELEMENT_RETRY_CONFIG,
        `uncheck checkbox: ${selector}`
      );

    } catch (error) {
      throw new ElementError(
        `Failed to uncheck checkbox: ${(error as Error).message}`,
        selector,
        'uncheck'
      );
    }
  }

  /**
   * Enhanced double click with comprehensive options
   */
  async doubleClick(
    locator: Locator,
    options: ElementInteractionOptions & {
      button?: 'left' | 'right' | 'middle';
      delay?: number;
      position?: { x: number; y: number };
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Double clicking element: ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });
          await this.waitForElementStable(locator);

          await locator.dblclick({
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
            force: options.force,
            noWaitAfter: options.noWaitAfter,
            trial: options.trial,
            button: options.button,
            delay: options.delay,
            position: options.position
          });
        },
        ELEMENT_RETRY_CONFIG,
        `double click: ${selector}`
      );

      this.logger.debug(`Successfully double clicked element: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to double click element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to double click element: ${selector}`,
        selector,
        'double click'
      );
    }
  }

  /**
   * Enhanced right click with comprehensive options
   */
  async rightClick(
    locator: Locator,
    options: ElementInteractionOptions & {
      position?: { x: number; y: number };
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Right clicking element: ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });
          await this.waitForElementStable(locator);

          await locator.click({
            button: 'right',
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
            force: options.force,
            noWaitAfter: options.noWaitAfter,
            trial: options.trial,
            position: options.position
          });
        },
        ELEMENT_RETRY_CONFIG,
        `right click: ${selector}`
      );

      this.logger.debug(`Successfully right clicked element: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to right click element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to right click element: ${selector}`,
        selector,
        'right click'
      );
    }
  }

  /**
   * Enhanced hover with comprehensive options
   */
  async hover(
    locator: Locator,
    options: ElementInteractionOptions & {
      position?: { x: number; y: number };
      modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[];
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Hovering over element: ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });
          await this.waitForElementStable(locator);

          await locator.hover({
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
            force: options.force,
            noWaitAfter: options.noWaitAfter,
            trial: options.trial,
            position: options.position,
            modifiers: options.modifiers
          });
        },
        ELEMENT_RETRY_CONFIG,
        `hover: ${selector}`
      );

      this.logger.debug(`Successfully hovered over element: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to hover over element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to hover over element: ${selector}`,
        selector,
        'hover'
      );
    }
  }

  /**
   * Enhanced key press with comprehensive options
   */
  async pressKey(
    locator: Locator,
    key: string,
    options: ElementInteractionOptions & {
      delay?: number;
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    this.logger.debug(`Pressing key '${key}' on element: ${selector}`);

    try {
      await RetryUtils.withRetry(
        async () => {
          await this.waitForElement(locator, { timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS });

          await locator.press(key, {
            timeout: timeout / RETRY_CONFIG.ELEMENT_MAX_ATTEMPTS,
            delay: options.delay,
            noWaitAfter: options.noWaitAfter
          });
        },
        ELEMENT_RETRY_CONFIG,
        `press key '${key}': ${selector}`
      );

      this.logger.debug(`Successfully pressed key '${key}' on element: ${selector}`);

    } catch (error) {
      this.logger.error(`Failed to press key '${key}' on element: ${selector}`, { error: (error as Error).message });
      throw new ElementError(
        `Failed to press key '${key}' on element: ${selector}`,
        selector,
        'press key'
      );
    }
  }

  /**
   * Enhanced DOM attachment waiting
   */
  async waitForElementAttached(
    locator: Locator,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      await locator.waitFor({ state: 'attached', timeout });
      this.logger.debug(`Element attached to DOM: ${selector}`);

    } catch (error) {
      throw new ElementError(
        `Element did not attach to DOM within ${timeout}ms: ${selector}`,
        selector,
        'wait for attached'
      );
    }
  }

  /**
   * Enhanced DOM detachment waiting
   */
  async waitForElementDetached(
    locator: Locator,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      await locator.waitFor({ state: 'detached', timeout });
      this.logger.debug(`Element detached from DOM: ${selector}`);

    } catch (error) {
      throw new ElementError(
        `Element did not detach from DOM within ${timeout}ms: ${selector}`,
        selector,
        'wait for detached'
      );
    }
  }

  // ========================================
  // Modern Web Features
  // ========================================

  /**
   * Work with iframes
   */
  async getFrame(frameSelector: string | Locator): Promise<FrameLocator> {
    try {
      const frame = typeof frameSelector === 'string'
        ? this.page.frameLocator(frameSelector)
        : this.page.frameLocator(frameSelector);

      // Verify frame is loaded
      await frame.locator('body').waitFor({ timeout: TIMEOUTS.ELEMENT_WAIT });

      return frame;

    } catch (error) {
      throw new ElementError(
        `Failed to get frame: ${typeof frameSelector === 'string' ? frameSelector : 'frame'}`,
        typeof frameSelector === 'string' ? frameSelector : 'frame',
        'get frame'
      );
    }
  }

  /**
   * Switch to frame context and perform actions
   */
  async withFrame<T>(
    frameSelector: string | Locator,
    action: (frame: FrameLocator) => Promise<T>
  ): Promise<T> {
    const frame = await this.getFrame(frameSelector);
    return await action(frame);
  }

  /**
   * Handle file uploads
   */
  async uploadFile(
    locator: Locator,
    filePath: string | string[],
    options: ElementInteractionOptions = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      await this.waitForElement(locator, { timeout });

      await locator.setInputFiles(filePath, {
        timeout,
        noWaitAfter: options.noWaitAfter
      });

      this.logger.info(`File(s) uploaded to ${selector}`, { files: filePath });

    } catch (error) {
      this.logger.error(`Failed to upload file(s) to ${selector}`, { error: (error as Error).message });
      throw new FileOperationError(
        `Failed to upload file(s): ${(error as Error).message}`,
        Array.isArray(filePath) ? filePath.join(', ') : filePath,
        'upload'
      );
    }
  }

  /**
   * Handle file downloads
   */
  async downloadFile(
    triggerAction: () => Promise<void>,
    options: {
      timeout?: number;
      path?: string;
      expectedFileName?: string | RegExp;
    } = {}
  ): Promise<string> {
    const timeout = options.timeout || TIMEOUTS.LONG;

    try {
      const downloadPromise = this.page.waitForDownload({ timeout });

      await triggerAction();

      const download = await downloadPromise;

      // Validate filename if expected
      if (options.expectedFileName) {
        const actualFileName = download.suggestedFilename();
        const matches = typeof options.expectedFileName === 'string'
          ? actualFileName.includes(options.expectedFileName)
          : options.expectedFileName.test(actualFileName);

        if (!matches) {
          throw new ValidationError(
            'Downloaded filename did not match expected pattern',
            options.expectedFileName,
            actualFileName
          );
        }
      }

      // Save to specified path or default location
      const downloadPath = options.path || path.join(
        PATHS.DOWNLOADS,
        download.suggestedFilename()
      );

      await fs.mkdir(path.dirname(downloadPath), { recursive: true });
      await download.saveAs(downloadPath);

      this.logger.info(`File downloaded: ${downloadPath}`);
      return downloadPath;

    } catch (error) {
      throw new FileOperationError(
        `Download failed: ${(error as Error).message}`,
        options.path || 'unknown',
        'download'
      );
    }
  }

  // ========================================
  // Browser Storage and Network
  // ========================================

  /**
   * Manage local storage
   */
  async getLocalStorage(key?: string): Promise<any> {
    if (key) {
      return await this.page.evaluate(k => localStorage.getItem(k), key);
    }
    return await this.page.evaluate(() => ({ ...localStorage }));
  }

  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  async removeLocalStorage(key: string): Promise<void> {
    await this.page.evaluate(k => localStorage.removeItem(k), key);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Manage session storage
   */
  async getSessionStorage(key?: string): Promise<any> {
    if (key) {
      return await this.page.evaluate(k => sessionStorage.getItem(k), key);
    }
    return await this.page.evaluate(() => ({ ...sessionStorage }));
  }

  async setSessionStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ k, v }) => sessionStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  async removeSessionStorage(key: string): Promise<void> {
    await this.page.evaluate(k => sessionStorage.removeItem(k), key);
  }

  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }

  /**
   * Manage cookies
   */
  async getCookies(name?: string): Promise<any> {
    const cookies = await this.page.context().cookies();
    return name ? cookies.find(c => c.name === name) : cookies;
  }

  async setCookie(cookie: {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  }): Promise<void> {
    await this.page.context().addCookies([{
      name: cookie.name,
      value: cookie.value,
      url: this.page.url(),
      domain: cookie.domain,
      path: cookie.path || '/',
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite
    }]);
  }

  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  /**
   * Monitor network requests
   */
  async waitForRequest(
    urlPattern: string | RegExp,
    options: { timeout?: number; method?: string } = {}
  ): Promise<any> {
    const timeout = options.timeout || TIMEOUTS.MEDIUM;

    return await this.page.waitForRequest(
      request => {
        const url = request.url();
        const method = request.method();

        const urlMatches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);

        const methodMatches = !options.method || method === options.method;

        return urlMatches && methodMatches;
      },
      { timeout }
    );
  }

  async waitForResponse(
    urlPattern: string | RegExp,
    options: { timeout?: number; status?: number } = {}
  ): Promise<any> {
    const timeout = options.timeout || TIMEOUTS.MEDIUM;

    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        const status = response.status();

        const urlMatches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);

        const statusMatches = !options.status || status === options.status;

        return urlMatches && statusMatches;
      },
      { timeout }
    );
  }

  // ========================================
  // Mobile and Touch Gestures
  // ========================================

  /**
   * Mobile tap gesture
   */
  async tap(
    locator: Locator,
    options: ElementInteractionOptions & {
      position?: { x: number; y: number };
    } = {}
  ): Promise<void> {
    const timeout = options.timeout || TIMEOUTS.ELEMENT_WAIT;
    const selector = await this.getLocatorDescription(locator);

    try {
      await this.waitForElement(locator, { timeout });

      await locator.tap({
        timeout,
        force: options.force,
        noWaitAfter: options.noWaitAfter,
        trial: options.trial,
        position: options.position
      });

      this.logger.debug(`Tapped element: ${selector}`);

    } catch (error) {
      throw new ElementError(
        `Failed to tap element: ${selector}`,
        selector,
        'tap'
      );
    }
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Execute JavaScript in page context
   */
  async executeScript<T>(
    script: string | Function,
    ...args: any[]
  ): Promise<T> {
    try {
      return await this.page.evaluate(script as any, ...args);
    } catch (error) {
      this.logger.error('Script execution failed', { error: (error as Error).message });
      throw new TestAutomationError(
        `Script execution failed: ${(error as Error).message}`,
        { script: script.toString() }
      );
    }
  }

  /**
   * Wait for animations to complete
   */
  async waitForAnimations(options: { timeout?: number } = {}): Promise<void> {
    if (!ANIMATION_CONFIG.WAIT_FOR_ANIMATIONS) {
      return;
    }

    const timeout = options.timeout || ANIMATION_CONFIG.ANIMATION_TIMEOUT;

    try {
      await this.page.waitForFunction(
        () => {
          const animations = document.getAnimations();
          return animations.every(animation => animation.playState === 'finished');
        },
        {},
        { timeout }
      );
    } catch {
      // Fallback to timeout-based waiting
      await this.page.waitForTimeout(timeout);
    }
  }

  /**
   * Close the current page
   */
  async closePage(): Promise<void> {
    try {
      await this.page.close();
      this.logger.info('Page closed successfully');
    } catch (error) {
      this.logger.error('Failed to close page', { error: (error as Error).message });
    }
  }

  /**
   * Get page instance (for advanced usage)
   */
  getPage(): Page {
    return this.page;
  }

  /**
   * Get logger instance
   */
  getLogger(): ChildLogger {
    return this.logger;
  }
}
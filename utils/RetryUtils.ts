/**
 * Retry utilities for handling flaky operations in test automation
 */

import { logger } from './Logger';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffFactor?: number;
  maxDelay?: number;
  retryIf?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffFactor: number;
  maxDelay: number;
  retryIf: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 1000,
  backoffFactor: 2,
  maxDelay: 10000,
  retryIf: () => true
};

/**
 * Retry configuration for network operations
 */
export const NETWORK_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  delay: 500,
  backoffFactor: 1.5,
  maxDelay: 5000,
  retryIf: (error: Error) => {
    // Retry on network errors, timeouts, and 5xx status codes
    return error.message.includes('timeout') ||
           error.message.includes('network') ||
           error.message.includes('5') ||
           error.message.includes('ECONNRESET') ||
           error.message.includes('ENOTFOUND');
  }
};

/**
 * Retry configuration for element interactions
 */
export const ELEMENT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delay: 500,
  backoffFactor: 1.2,
  maxDelay: 2000,
  retryIf: (error: Error) => {
    // Retry on element not found, not visible, or detached errors
    return error.message.includes('not visible') ||
           error.message.includes('not found') ||
           error.message.includes('detached') ||
           error.message.includes('not attached') ||
           error.message.includes('timeout');
  }
};

/**
 * Utility class for handling retries
 */
export class RetryUtils {
  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {},
    operationName?: string
  ): Promise<T> {
    const config: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...options
    };

    let lastError: Error | undefined;
    let currentDelay = config.delay;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();

        if (attempt > 1) {
          logger.info(`Operation '${operationName || 'unknown'}' succeeded on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if we should retry this error
        if (!config.retryIf(lastError)) {
          logger.debug(`Operation '${operationName || 'unknown'}' failed with non-retryable error`, {
            error: lastError.message,
            attempt
          });
          throw lastError;
        }

        // Don't retry on the last attempt
        if (attempt === config.maxAttempts) {
          logger.error(`Operation '${operationName || 'unknown'}' failed after ${config.maxAttempts} attempts`, {
            error: lastError.message,
            totalAttempts: config.maxAttempts
          });
          break;
        }

        // Log retry attempt
        logger.warn(`Operation '${operationName || 'unknown'}' failed, retrying in ${currentDelay}ms`, {
          error: lastError.message,
          attempt,
          maxAttempts: config.maxAttempts,
          delay: currentDelay
        });

        // Call retry callback if provided
        if (config.onRetry) {
          config.onRetry(lastError, attempt);
        }

        // Wait before retrying
        await this.delay(currentDelay);

        // Calculate next delay with backoff
        currentDelay = Math.min(
          currentDelay * config.backoffFactor,
          config.maxDelay
        );
      }
    }

    throw lastError || new Error('Unknown error occurred during retry operation');
  }

  /**
   * Execute a synchronous function with retry logic
   */
  static async withRetrySync<T>(
    operation: () => T,
    options: RetryOptions = {},
    operationName?: string
  ): Promise<T> {
    return this.withRetry(async () => operation(), options, operationName);
  }

  /**
   * Delay execution for specified milliseconds
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for a condition to be true with retry logic
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    options: RetryOptions & { checkInterval?: number } = {},
    conditionName?: string
  ): Promise<void> {
    const checkInterval = options.checkInterval || 100;
    const config: RetryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      maxAttempts: Math.floor((options.maxAttempts || 30000) / checkInterval),
      delay: checkInterval,
      backoffFactor: 1, // No backoff for condition checking
      ...options
    };

    await this.withRetry(
      async () => {
        const result = await condition();
        if (!result) {
          throw new Error(`Condition '${conditionName || 'unknown'}' not met`);
        }
        return result;
      },
      config,
      `Waiting for condition: ${conditionName || 'unknown'}`
    );
  }

  /**
   * Wait for a condition to be true synchronously with retry logic
   */
  static async waitForConditionSync(
    condition: () => boolean,
    options: RetryOptions & { checkInterval?: number } = {},
    conditionName?: string
  ): Promise<void> {
    await this.waitForCondition(
      async () => condition(),
      options,
      conditionName
    );
  }

  /**
   * Create a retryable version of a function
   */
  static retryable<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: RetryOptions = {},
    operationName?: string
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      return this.withRetry(
        () => fn(...args),
        options,
        operationName || fn.name
      );
    };
  }
}
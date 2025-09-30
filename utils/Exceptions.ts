/**
 * Custom exception classes for better error handling in test automation
 */

/**
 * Base exception class for all test automation errors
 */
export class TestAutomationError extends Error {
  public readonly timestamp: Date;
  public readonly context: Record<string, any> | undefined;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a detailed error message with context
   */
  getDetailedMessage(): string {
    let message = `[${this.timestamp.toISOString()}] ${this.name}: ${this.message}`;

    if (this.context && Object.keys(this.context).length > 0) {
      message += `\nContext: ${JSON.stringify(this.context, null, 2)}`;
    }

    return message;
  }
}

/**
 * Exception thrown when an element cannot be found or interacted with
 */
export class ElementError extends TestAutomationError {
  constructor(message: string, selector?: string, action?: string) {
    super(message, { selector, action });
  }
}

/**
 * Exception thrown when a timeout occurs
 */
export class TimeoutError extends TestAutomationError {
  public readonly timeoutMs: number;

  constructor(message: string, timeoutMs: number, operation?: string) {
    super(message, { timeoutMs, operation });
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Exception thrown when navigation fails
 */
export class NavigationError extends TestAutomationError {
  public readonly url: string;
  public readonly expectedUrl: string | undefined;

  constructor(message: string, url: string, expectedUrl?: string) {
    super(message, { url, expectedUrl });
    this.url = url;
    this.expectedUrl = expectedUrl;
  }
}

/**
 * Exception thrown when page loading fails
 */
export class PageLoadError extends TestAutomationError {
  public readonly loadState: string;

  constructor(message: string, loadState: string, url?: string) {
    super(message, { loadState, url });
    this.loadState = loadState;
  }
}

/**
 * Exception thrown when validation fails
 */
export class ValidationError extends TestAutomationError {
  public readonly expected: any;
  public readonly actual: any;

  constructor(message: string, expected: any, actual: any) {
    super(message, { expected, actual });
    this.expected = expected;
    this.actual = actual;
  }
}

/**
 * Exception thrown when configuration is invalid
 */
export class ConfigurationError extends TestAutomationError {
  public readonly configKey: string;
  public readonly configValue: any;

  constructor(message: string, configKey: string, configValue: any) {
    super(message, { configKey, configValue });
    this.configKey = configKey;
    this.configValue = configValue;
  }
}

/**
 * Exception thrown when network operations fail
 */
export class NetworkError extends TestAutomationError {
  public readonly status: number | undefined;
  public readonly statusText: string | undefined;

  constructor(message: string, status?: number, statusText?: string) {
    super(message, { status, statusText });
    this.status = status;
    this.statusText = statusText;
  }
}

/**
 * Exception thrown when file operations fail
 */
export class FileOperationError extends TestAutomationError {
  public readonly filePath: string;
  public readonly operation: string;

  constructor(message: string, filePath: string, operation: string) {
    super(message, { filePath, operation });
    this.filePath = filePath;
    this.operation = operation;
  }
}
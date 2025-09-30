/**
 * Constants for Rently test automation
 */

export const TIMEOUTS = {
  SHORT: 2000,
  MEDIUM: 5000,
  LONG: 15000,
  VERY_LONG: 30000,
  ELEMENT_WAIT: 5000,
  PAGE_LOAD: 15000,
  NETWORK_IDLE: 8000,
  ANIMATION: 500,
  RETRY_DELAY: 500
} as const;

export const SELECTORS = {
  LOADING: '[data-testid="loading"]',
  ERROR_MESSAGE: '[data-testid="error-message"]',
  SUCCESS_MESSAGE: '[data-testid="success-message"]',
  MODAL: '[role="dialog"]',
  TOAST: '[data-testid="toast"]',
  BUTTON: 'button',
  INPUT: 'input',
  SELECT: 'select',
  LINK: 'a',
  FORM: 'form'
} as const;

export const URLS = {
  TENANT_BASE: 'https://dev.rently.sa/en',
  ADMIN_BASE: 'https://admin.dev.rently.sa',
  TENANT_LOGIN: 'https://dev.rently.sa/en/login',
  ADMIN_LOGIN: 'https://admin.dev.rently.sa/ar/login',
  TENANT_DASHBOARD: 'https://dev.rently.sa/en/dashboard',
  ADMIN_DASHBOARD: 'https://admin.dev.rently.sa/ar/dashboard'
} as const;

export const MESSAGES = {
  SUCCESS: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    APPLICATION_SUBMITTED: 'Application submitted successfully',
    PAYMENT_SUCCESS: 'Payment processed successfully'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    NETWORK_ERROR: 'Network error occurred',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Server error occurred'
  }
} as const;

export const BROWSER_CONFIG = {
  HEADLESS: process.env['CI'] === 'true',
  SLOW_MO: process.env['CI'] === 'true' ? 0 : 100,
  VIEWPORT: {
    WIDTH: 1920,
    HEIGHT: 1080
  }
} as const;

export const TEST_ENVIRONMENT = {
  IS_CI: process.env['CI'] === 'true',
  IS_HEADLESS: process.env['HEADLESS'] === 'true',
  DEBUG_MODE: process.env['DEBUG'] === 'true'
} as const;

export const RETRY_CONFIG = {
  DEFAULT_MAX_ATTEMPTS: 3,
  ELEMENT_MAX_ATTEMPTS: 3,
  NETWORK_MAX_ATTEMPTS: 5,
  DEFAULT_DELAY: 1000,
  ELEMENT_DELAY: 500,
  NETWORK_DELAY: 500,
  BACKOFF_FACTOR: 2,
  MAX_DELAY: 10000
} as const;

export const PATHS = {
  SCREENSHOTS: process.env['SCREENSHOT_PATH'] || './screenshots',
  VIDEOS: process.env['VIDEO_PATH'] || './test-results/videos',
  TRACES: process.env['TRACE_PATH'] || './test-results/traces',
  DOWNLOADS: process.env['DOWNLOAD_PATH'] || './test-results/downloads',
  LOGS: process.env['LOG_PATH'] || './test-results/logs'
} as const;

export const FILE_EXTENSIONS = {
  SCREENSHOT: '.png',
  VIDEO: '.webm',
  TRACE: '.zip',
  LOG: '.log'
} as const;

export const ANIMATION_CONFIG = {
  DISABLED: process.env['CI'] === 'true' ? 'disabled' : 'allow',
  WAIT_FOR_ANIMATIONS: false, // Disabled for performance optimization
  ANIMATION_TIMEOUT: 200 // Reduced for faster test execution
} as const;

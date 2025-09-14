/**
 * Constants for Rently test automation
 */

export const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
  VERY_LONG: 60000
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
  HEADLESS: process.env.CI === 'true',
  SLOW_MO: process.env.CI === 'true' ? 0 : 100,
  VIEWPORT: {
    WIDTH: 1920,
    HEIGHT: 1080
  }
} as const;

export const TEST_ENVIRONMENT = {
  IS_CI: process.env.CI === 'true',
  IS_HEADLESS: process.env.HEADLESS === 'true',
  DEBUG_MODE: process.env.DEBUG === 'true'
} as const;

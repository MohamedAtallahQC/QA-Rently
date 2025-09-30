# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based test automation project for the Rently property management platform, testing both Tenant and Admin dashboards. The project uses TypeScript and follows the Page Object Model (POM) design pattern with advanced error handling, retry logic, and performance optimization.

## Development Commands

### Testing Commands
```bash
# Run all tests
npm test

# Run specific environment tests
npm run test:tenant          # All tenant tests (Chrome + Firefox)
npm run test:admin           # All admin tests (Chrome + Firefox)

# Run browser-specific tests
npm run test:tenant-chrome   # Tenant tests on Chrome only
npm run test:tenant-firefox  # Tenant tests on Firefox only
npm run test:admin-chrome    # Admin tests on Chrome only
npm run test:admin-firefox   # Admin tests on Firefox only

# Run specific test files
npm run test:landing         # Landing page tests only

# Development and debugging
npm run test:headed          # Run with browser UI visible
npm run test:debug           # Run in debug mode with Playwright inspector
npm run test:ui              # Run with Playwright test UI
npm run test:codegen         # Generate test code using Playwright codegen

# Reports and analysis
npm run test:report          # View HTML test report
npm run test:trace           # View test execution traces

# Setup
npm run test:install         # Install Playwright browsers
```

### Code Quality
```bash
npm run lint                 # Check code style and errors
npm run lint:fix             # Auto-fix linting issues
```

## Architecture Overview

### Project Structure
- **Pages/**: Page Object Model classes organized by application area
  - `BasePage.ts`: Enhanced base class with comprehensive utilities (1750+ lines)
  - `Tenant/`: Tenant-facing page objects (LandingPage, TenantLoginPage, TenantApplicationPage)
  - `Admin/`: Admin dashboard page objects (AdminLoginPage)
- **tests/**: Test specifications organized by application area
  - `tenant/`: Tenant dashboard test files
  - `admin/`: Admin dashboard test files
- **utils/**: Shared utilities and configuration
  - `Constants.ts`: Application constants, timeouts, retry configs
  - `TestData.ts`: Test data interfaces, factories, and generators
  - `Exceptions.ts`: Custom exception hierarchy for better error handling
  - `RetryUtils.ts`: Advanced retry logic with exponential backoff
  - `Logger.ts`: Structured logging with levels and context
  - `PerformanceMonitor.ts`: Performance tracking utilities
  - `Helpers.ts`: Common helper functions

### Page Object Model Architecture

**BasePage Pattern**: All page objects extend `BasePage.ts` (Pages/BasePage.ts:1) which provides:

**Element Interaction**:
- `clickElement()`, `doubleClick()`, `rightClick()`, `hover()` - with retry logic and stability checks
- `fillInput()` - with validation and clear options
- `getText()`, `selectOption()`, `checkCheckbox()`, `uncheckCheckbox()` - comprehensive form handling
- `waitForElement()`, `waitForElementStable()` - advanced wait strategies
- `isElementVisible()`, `isElementEnabled()` - state checking utilities

**Navigation & Page State**:
- `navigateTo()` - with network idle detection and error handling
- `waitForPageLoad()`, `waitForPageStable()` - multiple load state strategies
- `waitForUrl()`, `getCurrentUrl()` - URL management
- `reloadPage()`, `goBack()` - navigation controls
- `waitForNetworkIdle()` - customizable network monitoring with ignored URLs

**Browser Features**:
- `getFrame()`, `withFrame()` - iframe handling
- `uploadFile()`, `downloadFile()` - file operations with validation
- `getLocalStorage()`, `setLocalStorage()`, `getCookies()`, `setCookie()` - browser storage management
- `waitForRequest()`, `waitForResponse()` - network request monitoring

**User Interactions**:
- `tap()` - mobile touch gestures
- `scrollToElement()` - with behavior and position options
- `pressKey()` - keyboard interactions
- `handleNextDialog()` - dialog management with message validation

**Utilities**:
- `takeScreenshot()` - with flexible options
- `executeScript()` - JavaScript execution
- `waitForText()`, `waitForElementText()` - text-based waiting
- `getPageTitle()`, `verifyPageTitle()` - title validation

**Advanced Features**:
- Automatic retry logic with exponential backoff (uses RetryUtils)
- Custom exception hierarchy for specific error types
- Structured logging with context (uses Logger)
- Element stability checking (waits for animations/movement)
- Network idle detection with ignored URLs
- Comprehensive error messages with selectors and context

### Multi-Environment Configuration

The project is configured for two distinct environments:

**Tenant Environment** (`https://dev.rently.sa/en`):
- English language interface
- Property search and rental workflows
- Tenant authentication and dashboard
- Landing page with sections: hero, rent installments, track orders, promotions, FAQ

**Admin Environment** (`https://admin.dev.rently.sa`):
- Arabic language interface (right-to-left)
- Administrative functions and management
- Admin authentication and dashboard

### Test Configuration

**Multi-Project Setup** (playwright.config.ts:60): Tests are organized into separate Playwright projects:
- `tenant-chromium` / `tenant-firefox`: Tenant dashboard tests (base URL: `https://dev.rently.sa/en`)
- `admin-chromium` / `admin-firefox`: Admin dashboard tests (base URL: `https://admin.dev.rently.sa`)
- `webkit`: Cross-browser compatibility tests

**Performance Optimizations**:
- Global test timeout: 15 seconds (playwright.config.ts:27)
- Action timeout: 5 seconds (playwright.config.ts:39)
- Navigation timeout: 15 seconds (playwright.config.ts:41)
- Animation waits disabled for performance (utils/Constants.ts:97)
- Reduced animation timeout: 200ms (utils/Constants.ts:98)
- Browser launch args optimized for CI/CD (playwright.config.ts:46-55)

**Test Data Management**:
- Centralized test data in `utils/TestData.ts`
- Interface-driven data structures: `TenantUser`, `TenantApplicationData`, `AdminUser`, `PropertyInfo`
- Data generators: `generateRandomPhoneNumber()`, `generateRandomNationalId()`, `generateRandomTenantApplicationData()`
- Invalid data sets for validation testing: `getInvalidTenantApplicationData()`

**Error Handling**:
- Custom exception hierarchy (utils/Exceptions.ts):
  - `TestAutomationError` - base class with timestamp and context
  - `ElementError` - element interaction failures
  - `TimeoutError` - timeout-specific errors
  - `NavigationError` - navigation failures
  - `ValidationError` - validation failures
  - `PageLoadError`, `NetworkError`, `FileOperationError`, `ConfigurationError`
- All exceptions include detailed context and timestamps
- Automatic screenshot capture on test failures
- Trace collection for detailed test execution analysis
- Video recording for failed tests

**Retry Logic** (utils/RetryUtils.ts):
- `ELEMENT_RETRY_CONFIG`: 3 attempts, 500ms delay, 1.2x backoff (for element interactions)
- `NETWORK_RETRY_CONFIG`: 5 attempts, 500ms delay, 1.5x backoff (for network operations)
- Automatic retry for flaky operations (timeouts, element not found, network errors)
- Configurable retry conditions with `retryIf` predicates
- Exponential backoff with max delay cap

**Logging** (utils/Logger.ts):
- Structured logging with levels: ERROR, WARN, INFO, DEBUG, TRACE
- Context-aware logging with source tracking
- Child logger pattern for page-specific logs
- Configurable log level via `DEBUG` environment variable
- Log storage with automatic trimming (max 1000 entries)

### Key Testing Patterns

1. **Cross-Browser Testing**: All tests run on both Chrome and Firefox
2. **Parallel Execution**: Tests run in parallel for faster feedback (playwright.config.ts:17)
3. **Environment Isolation**: Separate base URLs and configurations per environment
4. **Responsive Testing**: Tests validate functionality across different viewport sizes
5. **Language Support**: Tests handle both English (tenant) and Arabic (admin) interfaces
6. **Performance-Optimized**: Reduced timeouts, disabled animation waits, batched operations
7. **Retry-Resilient**: Automatic retry logic for flaky element interactions and network requests
8. **Comprehensive Error Context**: Custom exceptions with detailed context for debugging

### Development Workflow

When adding new tests:
1. Create page objects in appropriate `Pages/` subdirectory
2. Extend `BasePage` for common functionality (all 100+ utility methods available)
3. Add test data to `TestData.ts` using defined interfaces
4. Write tests in corresponding `tests/` subdirectory
5. Use project-specific configurations for environment targeting
6. Leverage retry logic and custom exceptions for robust tests
7. Use structured logging for debugging

### Important Implementation Notes

**Element Locators**: Use Playwright's modern locator strategies:
- `page.getByRole()` for accessibility-based selection
- `page.getByText()` for text-based selection
- `page.locator()` for CSS/XPath selectors
- Chain with `.or()` for fallback selectors (e.g., `locator1.or(locator2)`)

**Async Operations**: All page object methods are async:
- Always await page object method calls
- Use `Promise.all()` for parallel operations (e.g., batch visibility checks)
- Example: `const [visible1, visible2] = await Promise.all([page.isVisible1(), page.isVisible2()])`

**Test Data**: Use factories and generators:
- `TestData.getRandomTenantUser()` - get predefined test user
- `TestData.generateRandomTenantApplicationData()` - generate dynamic test data
- `TestData.getInvalidTenantApplicationData()` - get invalid data for validation tests

**Constants**: Import from `utils/Constants.ts`:
- `TIMEOUTS` - standardized timeout values
- `RETRY_CONFIG` - retry configuration constants
- `URLS` - environment URLs
- `PATHS` - file system paths (screenshots: `./screenshots`, videos: `./test-results/videos`, traces: `./test-results/traces`)
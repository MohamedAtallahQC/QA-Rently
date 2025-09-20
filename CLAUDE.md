# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based test automation project for the Rently property management platform, testing both Tenant and Admin dashboards. The project uses TypeScript and follows the Page Object Model (POM) design pattern.

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
  - `BasePage.ts`: Common functionality and utilities for all pages
  - `Tenant/`: Tenant dashboard page objects
  - `Admin/`: Admin dashboard page objects
- **tests/**: Test specifications organized by application area
  - `tenant/`: Tenant dashboard test files
  - `admin/`: Admin dashboard test files
- **utils/**: Shared utilities and configuration
  - `TestData.ts`: Test data interfaces and configurations
  - `Helpers.ts`: Common helper functions
  - `Constants.ts`: Application constants and configurations

### Page Object Model Architecture

**BasePage Pattern**: All page objects extend `BasePage.ts` which provides:
- Common element interaction methods (`clickElement`, `fillInput`, `waitForElement`)
- Navigation utilities (`navigateTo`)
- Screenshot and error handling capabilities
- Consistent wait strategies and timeout handling

**Page Object Structure**: Each page object encapsulates:
- Page-specific locators and elements
- Page actions and business logic
- Data validation methods
- Navigation workflows

### Multi-Environment Configuration

The project is configured for two distinct environments:

**Tenant Environment** (`https://dev.rently.sa/en`):
- English language interface
- Property search and rental workflows
- Tenant authentication and dashboard

**Admin Environment** (`https://admin.dev.rently.sa`):
- Arabic language interface (right-to-left)
- Administrative functions and management
- Admin authentication and dashboard

### Test Configuration

**Multi-Project Setup**: Tests are organized into separate Playwright projects:
- `tenant-chromium` / `tenant-firefox`: Tenant dashboard tests
- `admin-chromium` / `admin-firefox`: Admin dashboard tests
- `webkit`: Cross-browser compatibility tests

**Test Data Management**:
- Centralized test data in `utils/TestData.ts`
- Interface-driven data structures for type safety
- Environment-specific configurations

**Error Handling and Debugging**:
- Automatic screenshot capture on test failures
- Trace collection for detailed test execution analysis
- Video recording for failed tests
- Configurable timeouts and retry mechanisms

### Key Testing Patterns

1. **Cross-Browser Testing**: All tests run on both Chrome and Firefox
2. **Parallel Execution**: Tests run in parallel for faster feedback
3. **Environment Isolation**: Separate base URLs and configurations per environment
4. **Responsive Testing**: Tests validate functionality across different viewport sizes
5. **Language Support**: Tests handle both English (tenant) and Arabic (admin) interfaces

### Development Workflow

When adding new tests:
1. Create page objects in appropriate `Pages/` subdirectory
2. Extend `BasePage` for common functionality
3. Add test data to `TestData.ts` using defined interfaces
4. Write tests in corresponding `tests/` subdirectory
5. Use project-specific configurations for environment targeting
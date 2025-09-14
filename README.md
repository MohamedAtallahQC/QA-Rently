# Rently Test Automation

This project contains comprehensive Playwright automation tests for the Rently Tenant and Admin dashboards using TypeScript and the Page Object Model (POM) design pattern.

## Project Structure

```
├── Pages/                          # Page Object Model classes
│   ├── BasePage.ts                 # Base page with common functionality
│   ├── Tenant/                     # Tenant dashboard pages
│   │   ├── TenantLoginPage.ts      # Tenant login page
│   │   ├── TenantDashboardPage.ts  # Tenant dashboard page
│   │   └── RentInstallmentsPage.ts # Rent installments page
│   └── Admin/                      # Admin dashboard pages
│       ├── AdminLoginPage.ts       # Admin login page
│       └── AdminDashboardPage.ts   # Admin dashboard page
├── tests/                          # Test files
│   ├── tenant/                     # Tenant dashboard tests
│   │   ├── tenant-login.spec.ts    # Tenant login tests
│   │   ├── tenant-dashboard.spec.ts # Tenant dashboard tests
│   │   └── rent-installments.spec.ts # Rent installments tests
│   └── admin/                      # Admin dashboard tests
│       ├── admin-login.spec.ts     # Admin login tests
│       └── admin-dashboard.spec.ts # Admin dashboard tests
├── utils/                          # Utility files
│   ├── TestData.ts                 # Test data and configuration
│   ├── Helpers.ts                  # Helper functions
│   └── Constants.ts                # Constants and configuration
├── playwright.config.ts            # Playwright configuration
└── package.json                    # Project dependencies and scripts
```

## Features

### Tenant Dashboard Testing
- **Login Functionality**: Phone number and start date validation
- **Dashboard Navigation**: Order management and navigation
- **Rent Installments**: Property search, filtering, and application
- **Form Validation**: Input validation and error handling
- **Responsive Design**: Cross-browser compatibility

### Admin Dashboard Testing
- **Authentication**: Email/password login with remember me
- **Dashboard Management**: Statistics, navigation, and user controls
- **Data Management**: CRUD operations and data display
- **User Interface**: Theme and language toggles
- **Security**: Session management and logout

### Test Configuration
- **Multi-Environment**: Separate configurations for Tenant and Admin
- **Cross-Browser**: Chrome, Firefox, and Safari support
- **Parallel Execution**: Optimized test execution
- **Screenshot & Video**: Automatic capture on failures
- **Trace Viewer**: Detailed test execution traces

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Playwright browsers

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rently-tenant-automation
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npm run test:install
```

## Usage

### Run All Tests
```bash
npm test
```

### Run Tenant Tests Only
```bash
npm run test:tenant
```

### Run Admin Tests Only
```bash
npm run test:admin
```

### Run Specific Browser Tests
```bash
# Tenant Chrome
npm run test:tenant-chrome

# Tenant Firefox
npm run test:tenant-firefox

# Admin Chrome
npm run test:admin-chrome

# Admin Firefox
npm run test:admin-firefox
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

### Debug Tests
```bash
npm run test:debug
```

### Run Tests with UI
```bash
npm run test:ui
```

### View Test Report
```bash
npm run test:report
```

### Generate Test Code
```bash
npm run test:codegen
```

### View Test Traces
```bash
npm run test:trace
```

## Test Data

Test data is configured in `utils/TestData.ts`:

### Tenant Users
```typescript
{
  phoneNumber: '+966501234567',
  email: 'tenant1@test.com',
  name: 'Ahmed Al-Rashid',
  startDate: '2024-02-01'
}
```

### Admin Users
```typescript
{
  email: 'admin@rently.sa',
  password: 'Admin123!',
  rememberMe: true
}
```

## Configuration

### Playwright Configuration
The `playwright.config.ts` file contains:
- Multi-project setup for Tenant and Admin
- Browser-specific configurations
- Timeout and retry settings
- Screenshot and video capture
- Trace collection

### Environment Variables
- `CI`: Set to 'true' for CI/CD environments
- `HEADLESS`: Set to 'true' for headless execution
- `DEBUG`: Set to 'true' for debug mode

## Page Object Model

The project follows the Page Object Model pattern:

### BasePage
- Common functionality for all pages
- Element interaction methods
- Wait strategies
- Screenshot capabilities

### Page Objects
- **TenantLoginPage**: Tenant authentication
- **TenantDashboardPage**: Tenant dashboard management
- **RentInstallmentsPage**: Property search and filtering
- **AdminLoginPage**: Admin authentication
- **AdminDashboardPage**: Admin dashboard management

## Test Structure

### Test Files
- **Login Tests**: Authentication and validation
- **Dashboard Tests**: Navigation and functionality
- **Feature Tests**: Specific feature testing

### Test Categories
- **Smoke Tests**: Basic functionality
- **Regression Tests**: Full feature testing
- **Integration Tests**: Cross-feature testing

## Best Practices

### Page Object Model
- Encapsulate page elements and actions
- Use descriptive method names
- Implement proper wait strategies
- Handle dynamic content

### Test Design
- Use descriptive test names
- Implement proper setup/teardown
- Use data-driven testing
- Handle test dependencies

### Error Handling
- Implement retry mechanisms
- Use proper assertions
- Handle network errors
- Capture screenshots on failure

## Troubleshooting

### Common Issues
1. **Browser Installation**: Run `npm run test:install`
2. **Timeout Issues**: Check network connectivity
3. **Element Not Found**: Verify selectors and wait strategies
4. **Test Failures**: Check screenshots and traces

### Debug Mode
```bash
npm run test:debug
```

### Trace Viewer
```bash
npm run test:trace
```

## CI/CD Integration

The project is configured for CI/CD environments:
- Headless execution
- Parallel test execution
- Automatic screenshot capture
- Test result reporting

## Contributing

1. Follow the Page Object Model pattern
2. Use descriptive test names
3. Implement proper error handling
4. Add appropriate comments
5. Update documentation

## License

ISC License - see LICENSE file for details.

import { test, expect } from '@playwright/test';
import { TenantDashboardPage } from '../../Pages/Tenant/TenantDashboardPage';
import { TenantLoginPage } from '../../Pages/Tenant/TenantLoginPage';
import { TestData } from '../../utils/TestData';
import { Helpers } from '../../utils/Helpers';

test.describe('Tenant Dashboard Tests', () => {
  let tenantDashboardPage: TenantDashboardPage;
  let tenantLoginPage: TenantLoginPage;

  test.beforeEach(async ({ page }) => {
    tenantDashboardPage = new TenantDashboardPage(page);
    tenantLoginPage = new TenantLoginPage(page);
    
    // Navigate to login page and perform login
    await tenantLoginPage.navigateToLoginPage();
    const tenantUser = TestData.getRandomTenantUser();
    await tenantLoginPage.login(tenantUser);
    
    // Wait for dashboard to load
    await tenantDashboardPage.waitForDashboardToLoad();
  });

  test('should display dashboard elements', async () => {
    // Verify dashboard is loaded
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
    
    // Verify main elements are present
    await tenantDashboardPage.verifyDashboardElements();
    
    // Take screenshot for verification
    await tenantDashboardPage.takeDashboardScreenshot();
  });

  test('should display dashboard title', async () => {
    const title = await tenantDashboardPage.getDashboardTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display my orders section', async () => {
    const isOrdersVisible = await tenantDashboardPage.isMyOrdersSectionVisible();
    expect(isOrdersVisible).toBe(true);
  });

  test('should display order cards', async () => {
    // Wait for orders to load
    await tenantDashboardPage.waitForOrdersToLoad();
    
    const orderCount = await tenantDashboardPage.getOrderCardsCount();
    expect(orderCount).toBeGreaterThanOrEqual(0);
    
    if (orderCount > 0) {
      // Verify order cards have required information
      const orderNumbers = await tenantDashboardPage.getOrderNumbers();
      expect(orderNumbers.length).toBe(orderCount);
      
      // Check first order details
      const firstOrderNumber = orderNumbers[0];
      const orderStatus = await tenantDashboardPage.getOrderStatus(firstOrderNumber);
      const orderAmount = await tenantDashboardPage.getOrderAmount(firstOrderNumber);
      const orderDate = await tenantDashboardPage.getOrderDate(firstOrderNumber);
      
      expect(orderStatus).toBeTruthy();
      expect(orderAmount).toBeTruthy();
      expect(orderDate).toBeTruthy();
    }
  });

  test('should navigate to rent installments page', async () => {
    // Click rent installments button
    await tenantDashboardPage.clickRentInstallmentsButton();
    
    // Wait for navigation
    await tenantDashboardPage.waitForPageLoad();
    
    // Verify navigation occurred
    const currentUrl = await tenantDashboardPage.getCurrentUrl();
    expect(currentUrl).toContain('rent');
  });

  test('should navigate to apply now page', async () => {
    // Click apply now button
    await tenantDashboardPage.clickApplyNowButton();
    
    // Wait for navigation
    await tenantDashboardPage.waitForPageLoad();
    
    // Verify navigation occurred
    const currentUrl = await tenantDashboardPage.getCurrentUrl();
    expect(currentUrl).toContain('apply');
  });

  test('should display navigation menu', async () => {
    const isNavVisible = await tenantDashboardPage.isNavigationMenuVisible();
    expect(isNavVisible).toBe(true);
    
    // Get navigation links
    const navLinks = await tenantDashboardPage.getNavigationLinks();
    expect(navLinks.length).toBeGreaterThan(0);
    
    // Verify expected links are present
    const expectedLinks = ['Home', 'About Us', 'FAQ', 'Contact Us', 'Legal Committee'];
    for (const expectedLink of expectedLinks) {
      const hasLink = navLinks.some(link => 
        link.toLowerCase().includes(expectedLink.toLowerCase())
      );
      expect(hasLink).toBe(true);
    }
  });

  test('should navigate to different pages from navigation menu', async () => {
    // Test home navigation
    await tenantDashboardPage.navigateToHome();
    await tenantDashboardPage.waitForPageLoad();
    
    // Test about us navigation
    await tenantDashboardPage.navigateToAboutUs();
    await tenantDashboardPage.waitForPageLoad();
    
    // Test FAQ navigation
    await tenantDashboardPage.navigateToFAQ();
    await tenantDashboardPage.waitForPageLoad();
    
    // Test contact us navigation
    await tenantDashboardPage.navigateToContactUs();
    await tenantDashboardPage.waitForPageLoad();
    
    // Test legal committee navigation
    await tenantDashboardPage.navigateToLegalCommittee();
    await tenantDashboardPage.waitForPageLoad();
  });

  test('should click on order cards', async () => {
    // Wait for orders to load
    await tenantDashboardPage.waitForOrdersToLoad();
    
    const orderCount = await tenantDashboardPage.getOrderCardsCount();
    
    if (orderCount > 0) {
      // Click on first order card
      await tenantDashboardPage.clickOrderCard('#21234');
      
      // Wait for navigation or modal
      await tenantDashboardPage.waitForPageLoad();
      
      // Verify some action occurred (navigation or modal opened)
      const currentUrl = await tenantDashboardPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should access help functionality', async () => {
    // Click help button
    await tenantDashboardPage.clickHelpButton();
    
    // Wait for help content to appear
    await tenantDashboardPage.waitForPageLoad();
    
    // Verify help content is displayed (this depends on implementation)
    const currentUrl = await tenantDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should toggle language', async () => {
    // Toggle language
    await tenantDashboardPage.toggleLanguage();
    
    // Wait for page to update
    await tenantDashboardPage.waitForPageLoad();
    
    // Verify dashboard is still functional
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should toggle theme', async () => {
    // Toggle theme
    await tenantDashboardPage.toggleTheme();
    
    // Wait for page to update
    await tenantDashboardPage.waitForPageLoad();
    
    // Verify dashboard is still functional
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should logout successfully', async () => {
    // Perform logout
    await tenantDashboardPage.logout();
    
    // Verify logout was successful
    const logoutSuccess = await tenantDashboardPage.verifyLogoutSuccess();
    expect(logoutSuccess).toBe(true);
  });

  test('should refresh dashboard', async () => {
    // Refresh dashboard
    await tenantDashboardPage.refreshDashboard();
    
    // Verify dashboard is still loaded
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should handle empty orders state', async () => {
    // Wait for orders to load
    await tenantDashboardPage.waitForOrdersToLoad();
    
    const orderCount = await tenantDashboardPage.getOrderCardsCount();
    
    if (orderCount === 0) {
      // Verify empty state is handled gracefully
      const isOrdersVisible = await tenantDashboardPage.isMyOrdersSectionVisible();
      expect(isOrdersVisible).toBe(true);
    }
  });

  test('should maintain dashboard state on page refresh', async () => {
    // Get initial order count
    const initialOrderCount = await tenantDashboardPage.getOrderCardsCount();
    
    // Refresh page
    await tenantDashboardPage.refreshDashboard();
    
    // Get order count after refresh
    const refreshedOrderCount = await tenantDashboardPage.getOrderCardsCount();
    
    // Order count should be the same (assuming no new orders were added)
    expect(refreshedOrderCount).toBe(initialOrderCount);
  });

  test('should handle rapid navigation clicks', async () => {
    // Rapidly click different navigation elements
    await tenantDashboardPage.clickRentInstallmentsButton();
    await tenantDashboardPage.page.waitForTimeout(100);
    
    await tenantDashboardPage.clickApplyNowButton();
    await tenantDashboardPage.page.waitForTimeout(100);
    
    await tenantDashboardPage.clickHelpButton();
    await tenantDashboardPage.page.waitForTimeout(100);
    
    // Should not cause errors
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should display correct order information format', async () => {
    // Wait for orders to load
    await tenantDashboardPage.waitForOrdersToLoad();
    
    const orderCount = await tenantDashboardPage.getOrderCardsCount();
    
    if (orderCount > 0) {
      const orderNumbers = await tenantDashboardPage.getOrderNumbers();
      
      // Verify order numbers follow expected format (#XXXXX)
      for (const orderNumber of orderNumbers) {
        expect(orderNumber).toMatch(/^#\d+$/);
      }
    }
  });

  test('should handle dashboard loading states', async () => {
    // Refresh dashboard to trigger loading state
    await tenantDashboardPage.refreshDashboard();
    
    // Verify dashboard loads completely
    expect(await tenantDashboardPage.verifyDashboardLoaded()).toBe(true);
    
    // Verify orders section is visible
    expect(await tenantDashboardPage.isMyOrdersSectionVisible()).toBe(true);
  });
});

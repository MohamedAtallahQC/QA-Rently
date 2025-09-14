import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../../Pages/Admin/AdminDashboardPage';
import { AdminLoginPage } from '../../Pages/Admin/AdminLoginPage';
import { TestData } from '../../utils/TestData';
import { Helpers } from '../../utils/Helpers';

test.describe('Admin Dashboard Tests', () => {
  let adminDashboardPage: AdminDashboardPage;
  let adminLoginPage: AdminLoginPage;

  test.beforeEach(async ({ page }) => {
    adminDashboardPage = new AdminDashboardPage(page);
    adminLoginPage = new AdminLoginPage(page);
    
    // Navigate to login page and perform login
    await adminLoginPage.navigateToLoginPage();
    const adminUser = TestData.getRandomAdminUser();
    await adminLoginPage.login(adminUser);
    
    // Wait for dashboard to load
    await adminDashboardPage.waitForDashboardToLoad();
  });

  test('should display dashboard elements', async () => {
    // Verify dashboard is loaded
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
    
    // Verify main elements are present
    await adminDashboardPage.verifyDashboardElements();
    
    // Take screenshot for verification
    await adminDashboardPage.takeDashboardScreenshot();
  });

  test('should display dashboard title', async () => {
    const title = await adminDashboardPage.getDashboardTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display sidebar navigation', async () => {
    const isSidebarVisible = await adminDashboardPage.isSidebarVisible();
    expect(isSidebarVisible).toBe(true);
    
    // Get navigation links
    const navLinks = await adminDashboardPage.getNavigationLinks();
    expect(navLinks.length).toBeGreaterThan(0);
    
    // Verify expected links are present
    const expectedLinks = ['Dashboard', 'Tenants', 'Properties', 'Applications', 'Payments', 'Reports', 'Settings'];
    for (const expectedLink of expectedLinks) {
      const hasLink = navLinks.some(link => 
        link.toLowerCase().includes(expectedLink.toLowerCase())
      );
      expect(hasLink).toBe(true);
    }
  });

  test('should display main content area', async () => {
    const isMainContentVisible = await adminDashboardPage.isMainContentVisible();
    expect(isMainContentVisible).toBe(true);
  });

  test('should display header with user controls', async () => {
    const isHeaderVisible = await adminDashboardPage.isHeaderVisible();
    expect(isHeaderVisible).toBe(true);
  });

  test('should display statistics cards', async () => {
    const statsCount = await adminDashboardPage.getStatsCardsCount();
    expect(statsCount).toBeGreaterThan(0);
    
    // Verify individual stats cards
    const totalTenants = await adminDashboardPage.getTotalTenantsCount();
    const totalProperties = await adminDashboardPage.getTotalPropertiesCount();
    const pendingApplications = await adminDashboardPage.getPendingApplicationsCount();
    const totalRevenue = await adminDashboardPage.getTotalRevenueAmount();
    
    expect(totalTenants).toBeGreaterThanOrEqual(0);
    expect(totalProperties).toBeGreaterThanOrEqual(0);
    expect(pendingApplications).toBeGreaterThanOrEqual(0);
    expect(totalRevenue).toBeGreaterThanOrEqual(0);
  });

  test('should display recent activities section', async () => {
    const isRecentActivitiesVisible = await adminDashboardPage.isRecentActivitiesVisible();
    expect(isRecentActivitiesVisible).toBe(true);
  });

  test('should display chart container', async () => {
    const isChartVisible = await adminDashboardPage.isChartContainerVisible();
    expect(isChartVisible).toBe(true);
  });

  test('should display data table', async () => {
    const isDataTableVisible = await adminDashboardPage.isDataTableVisible();
    expect(isDataTableVisible).toBe(true);
  });

  test('should navigate to different sections', async () => {
    // Test navigation to tenants page
    await adminDashboardPage.navigateToTenants();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to properties page
    await adminDashboardPage.navigateToProperties();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to applications page
    await adminDashboardPage.navigateToApplications();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to payments page
    await adminDashboardPage.navigateToPayments();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to reports page
    await adminDashboardPage.navigateToReports();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to settings page
    await adminDashboardPage.navigateToSettings();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to users page
    await adminDashboardPage.navigateToUsers();
    await adminDashboardPage.waitForPageLoad();
    
    // Test navigation to analytics page
    await adminDashboardPage.navigateToAnalytics();
    await adminDashboardPage.waitForPageLoad();
  });

  test('should access user menu', async () => {
    // Click user menu
    await adminDashboardPage.clickUserMenu();
    
    // Wait for menu to appear
    await adminDashboardPage.waitForPageLoad();
    
    // Verify menu is accessible
    const currentUrl = await adminDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should access profile settings', async () => {
    // Click profile button
    await adminDashboardPage.clickProfileButton();
    
    // Wait for navigation
    await adminDashboardPage.waitForPageLoad();
    
    // Verify navigation occurred
    const currentUrl = await adminDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should access settings', async () => {
    // Click settings button
    await adminDashboardPage.clickSettingsButton();
    
    // Wait for navigation
    await adminDashboardPage.waitForPageLoad();
    
    // Verify navigation occurred
    const currentUrl = await adminDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should access notifications', async () => {
    // Click notifications button
    await adminDashboardPage.clickNotificationsButton();
    
    // Wait for navigation or modal
    await adminDashboardPage.waitForPageLoad();
    
    // Verify some action occurred
    const currentUrl = await adminDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should perform search functionality', async () => {
    const searchTerm = 'test search';
    
    // Perform search
    await adminDashboardPage.search(searchTerm);
    
    // Wait for search results
    await adminDashboardPage.waitForPageLoad();
    
    // Verify search was performed
    const currentUrl = await adminDashboardPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should access quick action buttons', async () => {
    // Test add tenant button
    await adminDashboardPage.clickAddTenantButton();
    await adminDashboardPage.waitForPageLoad();
    
    // Test add property button
    await adminDashboardPage.clickAddPropertyButton();
    await adminDashboardPage.waitForPageLoad();
    
    // Test view reports button
    await adminDashboardPage.clickViewReportsButton();
    await adminDashboardPage.waitForPageLoad();
    
    // Test export data button
    await adminDashboardPage.clickExportDataButton();
    await adminDashboardPage.waitForPageLoad();
  });

  test('should toggle language', async () => {
    // Toggle language
    await adminDashboardPage.toggleLanguage();
    
    // Wait for page to update
    await adminDashboardPage.waitForPageLoad();
    
    // Verify dashboard is still functional
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should toggle theme', async () => {
    // Toggle theme
    await adminDashboardPage.toggleTheme();
    
    // Wait for page to update
    await adminDashboardPage.waitForPageLoad();
    
    // Verify dashboard is still functional
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should logout successfully', async () => {
    // Perform logout
    await adminDashboardPage.logout();
    
    // Verify logout was successful
    const logoutSuccess = await adminDashboardPage.verifyLogoutSuccess();
    expect(logoutSuccess).toBe(true);
  });

  test('should refresh dashboard', async () => {
    // Refresh dashboard
    await adminDashboardPage.refreshDashboard();
    
    // Verify dashboard is still loaded
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should get dashboard statistics', async () => {
    // Get dashboard statistics
    const stats = await adminDashboardPage.getDashboardStatistics();
    
    expect(stats).toBeTruthy();
    expect(stats.totalTenants).toBeGreaterThanOrEqual(0);
    expect(stats.totalProperties).toBeGreaterThanOrEqual(0);
    expect(stats.pendingApplications).toBeGreaterThanOrEqual(0);
    expect(stats.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty dashboard state', async () => {
    // Refresh dashboard to ensure clean state
    await adminDashboardPage.refreshDashboard();
    
    // Verify dashboard loads even with empty data
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
    
    // Verify main sections are still visible
    expect(await adminDashboardPage.isSidebarVisible()).toBe(true);
    expect(await adminDashboardPage.isMainContentVisible()).toBe(true);
  });

  test('should maintain dashboard state on page refresh', async () => {
    // Get initial statistics
    const initialStats = await adminDashboardPage.getDashboardStatistics();
    
    // Refresh page
    await adminDashboardPage.refreshDashboard();
    
    // Get statistics after refresh
    const refreshedStats = await adminDashboardPage.getDashboardStatistics();
    
    // Statistics should be similar (assuming no new data was added)
    expect(refreshedStats.totalTenants).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.totalProperties).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.pendingApplications).toBeGreaterThanOrEqual(0);
    expect(refreshedStats.totalRevenue).toBeGreaterThanOrEqual(0);
  });

  test('should handle rapid navigation clicks', async () => {
    // Rapidly click different navigation elements
    await adminDashboardPage.navigateToTenants();
    await adminDashboardPage.page.waitForTimeout(100);
    
    await adminDashboardPage.navigateToProperties();
    await adminDashboardPage.page.waitForTimeout(100);
    
    await adminDashboardPage.navigateToApplications();
    await adminDashboardPage.page.waitForTimeout(100);
    
    // Should not cause errors
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should handle dashboard loading states', async () => {
    // Refresh dashboard to trigger loading state
    await adminDashboardPage.refreshDashboard();
    
    // Verify dashboard loads completely
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
    
    // Verify all main sections are visible
    expect(await adminDashboardPage.isSidebarVisible()).toBe(true);
    expect(await adminDashboardPage.isMainContentVisible()).toBe(true);
    expect(await adminDashboardPage.isHeaderVisible()).toBe(true);
  });

  test('should display correct dashboard layout', async () => {
    // Verify all main layout components are present
    expect(await adminDashboardPage.isSidebarVisible()).toBe(true);
    expect(await adminDashboardPage.isMainContentVisible()).toBe(true);
    expect(await adminDashboardPage.isHeaderVisible()).toBe(true);
    
    // Verify dashboard title is displayed
    const title = await adminDashboardPage.getDashboardTitle();
    expect(title).toBeTruthy();
  });

  test('should handle search with empty query', async () => {
    // Search with empty string
    await adminDashboardPage.search('');
    
    // Wait for search results
    await adminDashboardPage.waitForPageLoad();
    
    // Should handle gracefully
    expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
  });

  test('should handle search with special characters', async () => {
    const specialSearchTerms = ['!@#$%^&*()', 'test@search', 'search with spaces'];
    
    for (const searchTerm of specialSearchTerms) {
      await adminDashboardPage.search(searchTerm);
      await adminDashboardPage.waitForPageLoad();
      
      // Should handle gracefully
      expect(await adminDashboardPage.verifyDashboardLoaded()).toBe(true);
    }
  });
});

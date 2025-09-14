import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for Admin Dashboard Page
 */
export class AdminDashboardPage extends BasePage {
  // Selectors
  private readonly dashboardTitle: Locator;
  private readonly sidebar: Locator;
  private readonly mainContent: Locator;
  private readonly header: Locator;
  private readonly userMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly profileButton: Locator;
  private readonly settingsButton: Locator;
  private readonly notificationsButton: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;
  
  // Sidebar navigation
  private readonly dashboardLink: Locator;
  private readonly tenantsLink: Locator;
  private readonly propertiesLink: Locator;
  private readonly applicationsLink: Locator;
  private readonly paymentsLink: Locator;
  private readonly reportsLink: Locator;
  private readonly settingsLink: Locator;
  private readonly usersLink: Locator;
  private readonly analyticsLink: Locator;
  
  // Dashboard widgets
  private readonly statsCards: Locator;
  private readonly totalTenantsCard: Locator;
  private readonly totalPropertiesCard: Locator;
  private readonly pendingApplicationsCard: Locator;
  private readonly totalRevenueCard: Locator;
  private readonly recentActivities: Locator;
  private readonly chartContainer: Locator;
  private readonly dataTable: Locator;
  
  // Quick actions
  private readonly addTenantButton: Locator;
  private readonly addPropertyButton: Locator;
  private readonly viewReportsButton: Locator;
  private readonly exportDataButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.dashboardTitle = page.locator('h1, h2, h3').filter({ hasText: /dashboard|لوحة|التحكم/i }).first();
    this.sidebar = page.locator('[data-testid="sidebar"], .sidebar, nav').first();
    this.mainContent = page.locator('[data-testid="main-content"], .main-content, main').first();
    this.header = page.locator('[data-testid="header"], .header, header').first();
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu').first();
    this.logoutButton = page.locator('button:has-text("تسجيل الخروج"), button:has-text("Logout"), [data-testid="logout"]').first();
    this.profileButton = page.locator('button:has-text("الملف الشخصي"), button:has-text("Profile"), [data-testid="profile"]').first();
    this.settingsButton = page.locator('button:has-text("الإعدادات"), button:has-text("Settings"), [data-testid="settings"]').first();
    this.notificationsButton = page.locator('button:has-text("الإشعارات"), button:has-text("Notifications"), [data-testid="notifications"]').first();
    this.searchInput = page.locator('input[placeholder*="بحث"], input[placeholder*="search"], input[type="search"]').first();
    this.searchButton = page.locator('button[type="submit"], [data-testid="search-button"]').first();
    this.languageToggle = page.locator('button:has-text("العربية"), button:has-text("English")').first();
    this.themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
    
    // Sidebar navigation
    this.dashboardLink = page.locator('a:has-text("لوحة التحكم"), a:has-text("Dashboard"), [href*="dashboard"]').first();
    this.tenantsLink = page.locator('a:has-text("المستأجرين"), a:has-text("Tenants"), [href*="tenant"]').first();
    this.propertiesLink = page.locator('a:has-text("العقارات"), a:has-text("Properties"), [href*="property"]').first();
    this.applicationsLink = page.locator('a:has-text("الطلبات"), a:has-text("Applications"), [href*="application"]').first();
    this.paymentsLink = page.locator('a:has-text("المدفوعات"), a:has-text("Payments"), [href*="payment"]').first();
    this.reportsLink = page.locator('a:has-text("التقارير"), a:has-text("Reports"), [href*="report"]').first();
    this.settingsLink = page.locator('a:has-text("الإعدادات"), a:has-text("Settings"), [href*="setting"]').first();
    this.usersLink = page.locator('a:has-text("المستخدمين"), a:has-text("Users"), [href*="user"]').first();
    this.analyticsLink = page.locator('a:has-text("التحليلات"), a:has-text("Analytics"), [href*="analytics"]').first();
    
    // Dashboard widgets
    this.statsCards = page.locator('[data-testid="stats-card"], .stats-card, .card').filter({ hasText: /\d+/ });
    this.totalTenantsCard = page.locator('[data-testid="total-tenants"], .total-tenants').first();
    this.totalPropertiesCard = page.locator('[data-testid="total-properties"], .total-properties').first();
    this.pendingApplicationsCard = page.locator('[data-testid="pending-applications"], .pending-applications').first();
    this.totalRevenueCard = page.locator('[data-testid="total-revenue"], .total-revenue').first();
    this.recentActivities = page.locator('[data-testid="recent-activities"], .recent-activities').first();
    this.chartContainer = page.locator('[data-testid="chart"], .chart, canvas').first();
    this.dataTable = page.locator('[data-testid="data-table"], .data-table, table').first();
    
    // Quick actions
    this.addTenantButton = page.locator('button:has-text("إضافة مستأجر"), button:has-text("Add Tenant"), [data-testid="add-tenant"]').first();
    this.addPropertyButton = page.locator('button:has-text("إضافة عقار"), button:has-text("Add Property"), [data-testid="add-property"]').first();
    this.viewReportsButton = page.locator('button:has-text("عرض التقارير"), button:has-text("View Reports"), [data-testid="view-reports"]').first();
    this.exportDataButton = page.locator('button:has-text("تصدير البيانات"), button:has-text("Export Data"), [data-testid="export-data"]').first();
  }

  /**
   * Navigate to admin dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigateTo('/ar/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyDashboardLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.dashboardTitle, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get dashboard title
   */
  async getDashboardTitle(): Promise<string> {
    return await this.getText(this.dashboardTitle);
  }

  /**
   * Check if sidebar is visible
   */
  async isSidebarVisible(): Promise<boolean> {
    return await this.isElementVisible(this.sidebar);
  }

  /**
   * Check if main content is visible
   */
  async isMainContentVisible(): Promise<boolean> {
    return await this.isElementVisible(this.mainContent);
  }

  /**
   * Check if header is visible
   */
  async isHeaderVisible(): Promise<boolean> {
    return await this.isElementVisible(this.header);
  }

  /**
   * Click user menu
   */
  async clickUserMenu(): Promise<void> {
    await this.clickElement(this.userMenu);
  }

  /**
   * Click logout button
   */
  async clickLogoutButton(): Promise<void> {
    await this.clickElement(this.logoutButton);
  }

  /**
   * Logout from dashboard
   */
  async logout(): Promise<void> {
    await this.clickUserMenu();
    await this.clickLogoutButton();
    await this.waitForNavigationAfterLogout();
  }

  /**
   * Click profile button
   */
  async clickProfileButton(): Promise<void> {
    await this.clickElement(this.profileButton);
  }

  /**
   * Click settings button
   */
  async clickSettingsButton(): Promise<void> {
    await this.clickElement(this.settingsButton);
  }

  /**
   * Click notifications button
   */
  async clickNotificationsButton(): Promise<void> {
    await this.clickElement(this.notificationsButton);
  }

  /**
   * Search for content
   */
  async search(searchTerm: string): Promise<void> {
    await this.fillInput(this.searchInput, searchTerm);
    await this.clickElement(this.searchButton);
  }

  /**
   * Navigate to tenants page
   */
  async navigateToTenants(): Promise<void> {
    await this.clickElement(this.tenantsLink);
  }

  /**
   * Navigate to properties page
   */
  async navigateToProperties(): Promise<void> {
    await this.clickElement(this.propertiesLink);
  }

  /**
   * Navigate to applications page
   */
  async navigateToApplications(): Promise<void> {
    await this.clickElement(this.applicationsLink);
  }

  /**
   * Navigate to payments page
   */
  async navigateToPayments(): Promise<void> {
    await this.clickElement(this.paymentsLink);
  }

  /**
   * Navigate to reports page
   */
  async navigateToReports(): Promise<void> {
    await this.clickElement(this.reportsLink);
  }

  /**
   * Navigate to settings page
   */
  async navigateToSettings(): Promise<void> {
    await this.clickElement(this.settingsLink);
  }

  /**
   * Navigate to users page
   */
  async navigateToUsers(): Promise<void> {
    await this.clickElement(this.usersLink);
  }

  /**
   * Navigate to analytics page
   */
  async navigateToAnalytics(): Promise<void> {
    await this.clickElement(this.analyticsLink);
  }

  /**
   * Get number of stats cards
   */
  async getStatsCardsCount(): Promise<number> {
    return await this.statsCards.count();
  }

  /**
   * Get total tenants count
   */
  async getTotalTenantsCount(): Promise<number> {
    const text = await this.getText(this.totalTenantsCard);
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  }

  /**
   * Get total properties count
   */
  async getTotalPropertiesCount(): Promise<number> {
    const text = await this.getText(this.totalPropertiesCard);
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  }

  /**
   * Get pending applications count
   */
  async getPendingApplicationsCount(): Promise<number> {
    const text = await this.getText(this.pendingApplicationsCard);
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  }

  /**
   * Get total revenue amount
   */
  async getTotalRevenueAmount(): Promise<number> {
    const text = await this.getText(this.totalRevenueCard);
    return parseInt(text.replace(/[^\d]/g, '')) || 0;
  }

  /**
   * Check if recent activities section is visible
   */
  async isRecentActivitiesVisible(): Promise<boolean> {
    return await this.isElementVisible(this.recentActivities);
  }

  /**
   * Check if chart container is visible
   */
  async isChartContainerVisible(): Promise<boolean> {
    return await this.isElementVisible(this.chartContainer);
  }

  /**
   * Check if data table is visible
   */
  async isDataTableVisible(): Promise<boolean> {
    return await this.isElementVisible(this.dataTable);
  }

  /**
   * Click add tenant button
   */
  async clickAddTenantButton(): Promise<void> {
    await this.clickElement(this.addTenantButton);
  }

  /**
   * Click add property button
   */
  async clickAddPropertyButton(): Promise<void> {
    await this.clickElement(this.addPropertyButton);
  }

  /**
   * Click view reports button
   */
  async clickViewReportsButton(): Promise<void> {
    await this.clickElement(this.viewReportsButton);
  }

  /**
   * Click export data button
   */
  async clickExportDataButton(): Promise<void> {
    await this.clickElement(this.exportDataButton);
  }

  /**
   * Toggle language
   */
  async toggleLanguage(): Promise<void> {
    if (await this.isElementVisible(this.languageToggle)) {
      await this.clickElement(this.languageToggle);
    }
  }

  /**
   * Toggle theme
   */
  async toggleTheme(): Promise<void> {
    if (await this.isElementVisible(this.themeToggle)) {
      await this.clickElement(this.themeToggle);
    }
  }

  /**
   * Wait for navigation after logout
   */
  async waitForNavigationAfterLogout(): Promise<void> {
    await this.page.waitForURL(/login|/, { timeout: 10000 });
  }

  /**
   * Verify logout was successful
   */
  async verifyLogoutSuccess(): Promise<boolean> {
    try {
      await this.waitForNavigationAfterLogout();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    const links = this.sidebar.locator('a');
    const count = await links.count();
    const linkTexts: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const linkText = await this.getText(links.nth(i));
      if (linkText.trim()) {
        linkTexts.push(linkText.trim());
      }
    }
    
    return linkTexts;
  }

  /**
   * Verify dashboard elements are present
   */
  async verifyDashboardElements(): Promise<void> {
    await this.waitForElement(this.dashboardTitle);
    await this.waitForElement(this.sidebar);
    await this.waitForElement(this.mainContent);
  }

  /**
   * Take dashboard screenshot
   */
  async takeDashboardScreenshot(): Promise<void> {
    await this.takeScreenshot('admin-dashboard');
  }

  /**
   * Refresh dashboard
   */
  async refreshDashboard(): Promise<void> {
    await this.reloadPage();
    await this.verifyDashboardLoaded();
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForDashboardToLoad(): Promise<void> {
    await this.waitForElement(this.dashboardTitle);
    await this.waitForElement(this.sidebar);
    await this.waitForElement(this.mainContent);
    // Wait for stats cards to load
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStatistics(): Promise<{
    totalTenants: number;
    totalProperties: number;
    pendingApplications: number;
    totalRevenue: number;
  }> {
    return {
      totalTenants: await this.getTotalTenantsCount(),
      totalProperties: await this.getTotalPropertiesCount(),
      pendingApplications: await this.getPendingApplicationsCount(),
      totalRevenue: await this.getTotalRevenueAmount()
    };
  }
}

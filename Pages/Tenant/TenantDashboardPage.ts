import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for Tenant Dashboard Page
 */
export class TenantDashboardPage extends BasePage {
  // Selectors
  private readonly dashboardTitle: Locator;
  private readonly myOrdersSection: Locator;
  private readonly orderCards: Locator;
  private readonly orderNumber: Locator;
  private readonly orderStatus: Locator;
  private readonly orderAmount: Locator;
  private readonly orderDate: Locator;
  private readonly helpButton: Locator;
  private readonly profileMenu: Locator;
  private readonly logoutButton: Locator;
  private readonly rentInstallmentsButton: Locator;
  private readonly applyNowButton: Locator;
  private readonly navigationMenu: Locator;
  private readonly homeLink: Locator;
  private readonly aboutUsLink: Locator;
  private readonly faqLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly legalCommitteeLink: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.dashboardTitle = page.locator('h1, h2, h3').filter({ hasText: /dashboard|orders|rent/i }).first();
    this.myOrdersSection = page.locator('[data-testid="my-orders"], .my-orders, .orders-section').first();
    this.orderCards = page.locator('[data-testid="order-card"], .order-card, .card').filter({ hasText: /#\d+/ });
    this.orderNumber = page.locator('[data-testid="order-number"], .order-number').filter({ hasText: /#\d+/ });
    this.orderStatus = page.locator('[data-testid="order-status"], .order-status, .status');
    this.orderAmount = page.locator('[data-testid="order-amount"], .order-amount, .amount');
    this.orderDate = page.locator('[data-testid="order-date"], .order-date, .date');
    this.helpButton = page.locator('button:has-text("Help"), [data-testid="help"]').first();
    this.profileMenu = page.locator('[data-testid="profile-menu"], .profile-menu, .user-menu').first();
    this.logoutButton = page.locator('button:has-text("Logout"), [data-testid="logout"]').first();
    this.rentInstallmentsButton = page.locator('button:has-text("Rent Installments"), a:has-text("Rent Installments")').first();
    this.applyNowButton = page.locator('button:has-text("Apply Now"), a:has-text("Apply Now")').first();
    this.navigationMenu = page.locator('nav, .navigation, .navbar').first();
    this.homeLink = page.locator('a:has-text("Home"), [href*="home"]').first();
    this.aboutUsLink = page.locator('a:has-text("About Us"), [href*="about"]').first();
    this.faqLink = page.locator('a:has-text("FAQ"), [href*="faq"]').first();
    this.contactUsLink = page.locator('a:has-text("Contact Us"), [href*="contact"]').first();
    this.legalCommitteeLink = page.locator('a:has-text("Legal Committee"), [href*="legal"]').first();
    this.languageToggle = page.locator('button:has-text("العربية"), button:has-text("English")').first();
    this.themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
  }

  /**
   * Navigate to tenant dashboard
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigateTo('/dashboard');
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
   * Check if my orders section is visible
   */
  async isMyOrdersSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.myOrdersSection);
  }

  /**
   * Get number of order cards
   */
  async getOrderCardsCount(): Promise<number> {
    return await this.orderCards.count();
  }

  /**
   * Get order numbers
   */
  async getOrderNumbers(): Promise<string[]> {
    const count = await this.getOrderCardsCount();
    const orderNumbers: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const orderCard = this.orderCards.nth(i);
      const orderNumberElement = orderCard.locator('[data-testid="order-number"], .order-number').filter({ hasText: /#\d+/ });
      if (await this.isElementVisible(orderNumberElement)) {
        const orderNumber = await this.getText(orderNumberElement);
        orderNumbers.push(orderNumber);
      }
    }
    
    return orderNumbers;
  }

  /**
   * Get order status by order number
   */
  async getOrderStatus(orderNumber: string): Promise<string> {
    const orderCard = this.orderCards.filter({ hasText: orderNumber }).first();
    const statusElement = orderCard.locator('[data-testid="order-status"], .order-status, .status');
    return await this.getText(statusElement);
  }

  /**
   * Get order amount by order number
   */
  async getOrderAmount(orderNumber: string): Promise<string> {
    const orderCard = this.orderCards.filter({ hasText: orderNumber }).first();
    const amountElement = orderCard.locator('[data-testid="order-amount"], .order-amount, .amount');
    return await this.getText(amountElement);
  }

  /**
   * Get order date by order number
   */
  async getOrderDate(orderNumber: string): Promise<string> {
    const orderCard = this.orderCards.filter({ hasText: orderNumber }).first();
    const dateElement = orderCard.locator('[data-testid="order-date"], .order-date, .date');
    return await this.getText(dateElement);
  }

  /**
   * Click on specific order card
   */
  async clickOrderCard(orderNumber: string): Promise<void> {
    const orderCard = this.orderCards.filter({ hasText: orderNumber }).first();
    await this.clickElement(orderCard);
  }

  /**
   * Click help button
   */
  async clickHelpButton(): Promise<void> {
    await this.clickElement(this.helpButton);
  }

  /**
   * Click profile menu
   */
  async clickProfileMenu(): Promise<void> {
    await this.clickElement(this.profileMenu);
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
    await this.clickProfileMenu();
    await this.clickLogoutButton();
    await this.waitForNavigationAfterLogout();
  }

  /**
   * Click rent installments button
   */
  async clickRentInstallmentsButton(): Promise<void> {
    await this.clickElement(this.rentInstallmentsButton);
  }

  /**
   * Click apply now button
   */
  async clickApplyNowButton(): Promise<void> {
    await this.clickElement(this.applyNowButton);
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.clickElement(this.homeLink);
  }

  /**
   * Navigate to about us page
   */
  async navigateToAboutUs(): Promise<void> {
    await this.clickElement(this.aboutUsLink);
  }

  /**
   * Navigate to FAQ page
   */
  async navigateToFAQ(): Promise<void> {
    await this.clickElement(this.faqLink);
  }

  /**
   * Navigate to contact us page
   */
  async navigateToContactUs(): Promise<void> {
    await this.clickElement(this.contactUsLink);
  }

  /**
   * Navigate to legal committee page
   */
  async navigateToLegalCommittee(): Promise<void> {
    await this.clickElement(this.legalCommitteeLink);
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
    await this.page.waitForURL(/login|home|/, { timeout: 10000 });
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
   * Check if navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    return await this.isElementVisible(this.navigationMenu);
  }

  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    const links = this.navigationMenu.locator('a');
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
    await this.waitForElement(this.myOrdersSection);
    await this.waitForElement(this.helpButton);
  }

  /**
   * Take dashboard screenshot
   */
  async takeDashboardScreenshot(): Promise<void> {
    await this.takeScreenshot('tenant-dashboard');
  }

  /**
   * Refresh dashboard
   */
  async refreshDashboard(): Promise<void> {
    await this.reloadPage();
    await this.verifyDashboardLoaded();
  }

  /**
   * Wait for orders to load
   */
  async waitForOrdersToLoad(): Promise<void> {
    await this.waitForElement(this.myOrdersSection);
    // Wait a bit more for order cards to load
    await this.page.waitForTimeout(2000);
  }
}

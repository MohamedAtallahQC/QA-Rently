import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for Rently Landing Page
 *
 * This class provides methods to interact with the Rently landing page at https://dev.rently.sa/en
 * The page includes:
 * - Hero section with CTA buttons
 * - Navigation with section scrolling
 * - Rent installments process steps
 * - Track orders dashboard preview
 * - Promotions section
 * - FAQ with Lessor/Tenant tabs
 * - Footer with contact information
 *
 * @example
 * const landingPage = new LandingPage(page);
 * await landingPage.navigateToLandingPage();
 * await landingPage.scrollToFAQ();
 * await landingPage.switchToTenantFAQTab();
 */
export class LandingPage extends BasePage {
  // Hero Section
  private readonly heroSection: Locator;
  private readonly heroTitle: Locator;
  private readonly heroSubtitle: Locator;
  private readonly knowMoreButton: Locator;
  private readonly applyNowButton: Locator;

  // Navigation
  private readonly navigationMenu: Locator;
  private readonly mobileNavigationDrawer: Locator;
  private readonly rentInstallmentsLink: Locator;
 
  private readonly faqLink: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;

 

  // Rent Installments Section
  private readonly rentInstallmentsSection: Locator;
  private readonly processSteps: Locator;

  // Track Orders Section
  private readonly trackOrdersSection: Locator;
  private readonly dashboardPreview: Locator;

  // Promotions Section
  private readonly promotionsSection: Locator;

  // FAQ Section
  private readonly faqSection: Locator;
  private readonly faqLessorTab: Locator;
  private readonly faqTenantTab: Locator;
  private readonly faqItems: Locator;
  private readonly faqQuestions: Locator;
  private readonly faqAnswers: Locator;

  // Footer
  private readonly footer: Locator;
  private readonly footerContactEmail: Locator;
  private readonly footerSocialLinks: Locator;
  private readonly footerApplyButton: Locator;
  private readonly footerRegisterButton: Locator;

  constructor(page: Page) {
    super(page, 'https://dev.rently.sa/');
    
    // Hero Section - optimized selectors
    this.heroSection = page.locator('section').first();
    this.heroTitle = page.getByRole('heading', { level: 1 }).first();
    this.heroSubtitle = page.locator('p').first();
    this.knowMoreButton = page.locator('a[href="/en#rent-installments"]');
    this.applyNowButton = page.locator('a[href="/en/tenant-application"]');

    // Navigation - optimized selectors
    this.navigationMenu = page.getByRole('navigation').first();
    this.mobileNavigationDrawer = page.locator('[role="menu"], .drawer, .mobile-nav');
    this.rentInstallmentsLink = page.locator('a[href*="rent-installments"], a[href="/en#rent-installments"]');
    this.faqLink = page.locator('a[href*="faq"], a[href*="#faqs"]');
    this.languageToggle = page.getByRole('link', { name: /العربية|arabic/i }).or(page.locator('a[href="/ar"]'));
    this.themeToggle = page.locator('[aria-label*="theme"], .theme-toggle, button:has-text("theme")');

    // Section locators - optimized for performance
    this.rentInstallmentsSection = page.locator('#rent-installments, [data-section="rent-installments"]');
    this.processSteps = this.rentInstallmentsSection.locator('.step, [data-step], [class*="step"], li');

    this.trackOrdersSection = page.locator('#track-orders, [data-section="track-orders"]');
    this.dashboardPreview = this.trackOrdersSection.locator('img, [data-testid="dashboard-preview"], .dashboard-image');

    this.promotionsSection = page.locator('#promotions, [data-section="promotions"]');

    // FAQ Section - optimized selectors
    this.faqSection = page.locator('#faqs, [data-section="faq"]');
    this.faqLessorTab = this.faqSection.getByRole('tab', { name: /lessor/i }).or(this.faqSection.locator('[value="lessor"], button:has-text("lessor")'));
    this.faqTenantTab = this.faqSection.getByRole('tab', { name: /tenant/i }).or(this.faqSection.locator('[value="tenant"], button:has-text("tenant")'));
    this.faqItems = this.faqSection.getByRole('button').or(this.faqSection.locator('[data-faq-item], .accordion-item, .faq-item'));
    this.faqQuestions = this.faqSection.locator('h3, h4, .question, [data-question]');
    this.faqAnswers = this.faqSection.locator('[data-state="open"], .answer, .accordion-content');

    // Footer - optimized selectors
    this.footer = page.getByRole('contentinfo').or(page.locator('footer'));
    this.footerContactEmail = this.footer.getByRole('link', { name: /info@rently\.sa/i }).or(this.footer.locator('a[href*="mailto"]'));
    this.footerSocialLinks = this.footer.getByRole('link').filter({ has: page.locator('[href*="linkedin"], [href*="instagram"], [href*="twitter"]') });
    this.footerApplyButton = this.footer.getByRole('link', { name: /apply/i }).or(this.footer.getByRole('button', { name: /apply/i }));
    this.footerRegisterButton = this.footer.getByRole('link', { name: /register/i }).or(this.footer.getByRole('button', { name: /register/i }));
  }

  /**
   * Navigate to landing page
   */
  async navigateToLandingPage(): Promise<void> {
    await this.navigateTo('/');
    await this.waitForPageLoad();
  }

  /**
   * Verify landing page is loaded
   */
  async verifyLandingPageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.heroSection, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  override async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get hero section title
   * @returns The hero title text, or empty string if not found
   */
  async getHeroTitle(): Promise<string> {
    try {
      await this.waitForElement(this.heroTitle, { timeout: 5000 });
      return await this.getText(this.heroTitle);
    } catch {
      console.warn('Hero title not found or not visible');
      return '';
    }
  }

  /**
   * Get hero section subtitle
   * @returns The hero subtitle text, or empty string if not found
   */
  async getHeroSubtitle(): Promise<string> {
    try {
      await this.waitForElement(this.heroSubtitle, { timeout: 5000 });
      return await this.getText(this.heroSubtitle);
    } catch {
      console.warn('Hero subtitle not found or not visible');
      return '';
    }
  }

  /**
   * Click know more button
   */
  async clickKnowMoreButton(): Promise<void> {
    await this.clickElement(this.knowMoreButton);
  }

  /**
   * Click apply now button
   */
  async clickApplyNowButton(): Promise<void> {
    await this.clickElement(this.applyNowButton);
  }

  /**
   * @deprecated Use clickApplyNowButton instead
   */
  async clickStartRentingButton(): Promise<void> {
    await this.clickApplyNowButton();
  }

  /**
   * Navigate to rent installments page
   */
  async navigateToRentInstallments(): Promise<void> {
    await this.clickElement(this.rentInstallmentsLink);
  }

  /**
   * @deprecated About us navigation may not exist on current page
   */
  async navigateToAboutUs(): Promise<void> {
    // Try to find about link in navigation, fallback to no-op
    const aboutLink = this.navigationMenu.locator('a:has-text("About"), a[href*="about"]');
    if (await this.isElementVisible(aboutLink)) {
      await this.clickElement(aboutLink);
    } else {
      console.warn('About us navigation not found on current page');
    }
  }

  /**
   * @deprecated Legal committee navigation may not exist on current page
   */
  async navigateToLegalCommittee(): Promise<void> {
    // Try to find legal link in navigation, fallback to no-op
    const legalLink = this.navigationMenu.locator('a:has-text("Legal"), a[href*="legal"]');
    if (await this.isElementVisible(legalLink)) {
      await this.clickElement(legalLink);
    } else {
      console.warn('Legal committee navigation not found on current page');
    }
  }

  /**
   * @deprecated Use scrollToFAQ for section scrolling instead
   */
  async navigateToFAQ(): Promise<void> {
    await this.scrollToFAQ();
  }

  /**
   * @deprecated Contact us navigation may not exist as separate page
   */
  async navigateToContactUs(): Promise<void> {
    // Try to scroll to footer which contains contact information
    await this.scrollToElement(this.footer);
  }

  /**
   * Scroll to rent installments section (does not navigate to new page)
   */
  async scrollToRentInstallments(): Promise<void> {
    await this.clickElement(this.rentInstallmentsLink);
    await this.waitForElement(this.rentInstallmentsSection);
  }

  /**
   * Scroll to track orders section
   */
  async scrollToTrackOrders(): Promise<void> {
    await this.scrollToElement(this.trackOrdersSection);
  }

  /**
   * Scroll to promotions section
   */
  async scrollToPromotions(): Promise<void> {
    await this.scrollToElement(this.promotionsSection);
  }

  /**
   * Scroll to FAQ section
   */
  async scrollToFAQ(): Promise<void> {
    await this.clickElement(this.faqLink);
    await this.waitForElement(this.faqSection);
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
   * Wait for theme change to complete
   */
  async waitForThemeChange(): Promise<void> {
    await this.page.waitForTimeout(500); // Allow theme transition
  }

  /**
   * Get current theme (light/dark)
   */
  async getCurrentTheme(): Promise<'light' | 'dark' | 'unknown'> {
    try {
      const htmlClass = await this.page.locator('html').getAttribute('class') || '';
      const bodyClass = await this.page.locator('body').getAttribute('class') || '';

      if (htmlClass.includes('dark') || bodyClass.includes('dark')) {
        return 'dark';
      } else if (htmlClass.includes('light') || bodyClass.includes('light')) {
        return 'light';
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get current language from URL
   */
  async getCurrentLanguage(): Promise<'en' | 'ar' | 'unknown'> {
    const url = this.getCurrentUrl() as string;
    if (url.includes('/en')) return 'en';
    if (url.includes('/ar')) return 'ar';
    return 'unknown';
  }

  /**
   * Check if rent installments section is visible
   */
  async isRentInstallmentsSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.rentInstallmentsSection);
  }

  /**
   * Check if track orders section is visible
   */
  async isTrackOrdersSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.trackOrdersSection);
  }

  /**
   * Check if promotions section is visible
   */
  async isPromotionsSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.promotionsSection);
  }

  /**
   * @deprecated Use isRentInstallmentsSectionVisible instead
   */
  async isFeaturesSectionVisible(): Promise<boolean> {
    return await this.isRentInstallmentsSectionVisible();
  }

  /**
   * @deprecated Use getProcessStepsCount instead - features are now process steps
   */
  async getFeatureCardsCount(): Promise<number> {
    return await this.getProcessStepsCount();
  }

  /**
   * @deprecated Use getProcessStepInfo instead - features are now process steps
   */
  async getFeatureInfo(index: number): Promise<{ title: string; description: string } | null> {
    return await this.getProcessStepInfo(index);
  }

  /**
   * @deprecated Use getAllProcessStepsInfo instead - features are now process steps
   */
  async getAllFeaturesInfo(): Promise<{ title: string; description: string }[]> {
    return await this.getAllProcessStepsInfo();
  }

  /**
   * @deprecated Use isRentInstallmentsSectionVisible instead
   */
  async isStepsSectionVisible(): Promise<boolean> {
    return await this.isRentInstallmentsSectionVisible();
  }

  /**
   * @deprecated Use getProcessStepsCount instead
   */
  async getStepCardsCount(): Promise<number> {
    return await this.getProcessStepsCount();
  }

  /**
   * @deprecated Use getProcessStepInfo instead - returns compatible format
   */
  async getStepInfo(index: number): Promise<{ number: string; title: string; description: string; time: string } | null> {
    const stepInfo = await this.getProcessStepInfo(index);
    if (!stepInfo) return null;

    return {
      number: (index + 1).toString(), // Generate step number based on index
      title: stepInfo.title,
      description: stepInfo.description,
      time: '' // Time information not available in new structure
    };
  }

  /**
   * @deprecated Use getAllProcessStepsInfo instead - returns compatible format
   */
  async getAllStepsInfo(): Promise<{ number: string; title: string; description: string; time: string }[]> {
    const steps = await this.getAllProcessStepsInfo();
    return steps.map((step, index) => ({
      number: (index + 1).toString(),
      title: step.title,
      description: step.description,
      time: ''
    }));
  }

  /**
   * Check if dashboard preview is visible
   */
  async isDashboardPreviewVisible(): Promise<boolean> {
    return await this.isElementVisible(this.dashboardPreview);
  }

  /**
   * Get dashboard preview title
   */
  async getDashboardPreviewTitle(): Promise<string> {
    const titleElement = this.trackOrdersSection.locator('h2, h3, .title, .dashboard-title');
    return await this.getText(titleElement);
  }

  /**
   * Get dashboard preview description
   */
  async getDashboardPreviewDescription(): Promise<string> {
    const descriptionElement = this.trackOrdersSection.locator('p, .description, .dashboard-description');
    return await this.getText(descriptionElement);
  }

  /**
   * Check if FAQ section is visible
   */
  async isFAQSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.faqSection);
  }

  /**
   * Get number of FAQ items
   */
  async getFAQItemsCount(): Promise<number> {
    return await this.faqItems.count();
  }

  /**
   * Switch to Lessor FAQ tab
   * @description Clicks the Lessor tab in the FAQ section and waits for content to load
   */
  async switchToLessorFAQTab(): Promise<void> {
    await this.clickElement(this.faqLessorTab);
    await this.page.waitForTimeout(500); // Wait for tab content to load
  }

  /**
   * Switch to Tenant FAQ tab
   * @description Clicks the Tenant tab in the FAQ section and waits for content to load
   */
  async switchToTenantFAQTab(): Promise<void> {
    await this.clickElement(this.faqTenantTab);
    await this.page.waitForTimeout(500); // Wait for tab content to load
  }

  /**
   * Get currently active FAQ tab
   * @returns 'lessor', 'tenant', or null if unable to determine
   * @description Checks the aria attributes to determine which FAQ tab is currently active
   */
  async getActiveFAQTab(): Promise<'lessor' | 'tenant' | null> {
    try {
      const lessorActive = await this.faqLessorTab.getAttribute('data-state') === 'active' ||
                          await this.faqLessorTab.getAttribute('aria-selected') === 'true';
      const tenantActive = await this.faqTenantTab.getAttribute('data-state') === 'active' ||
                          await this.faqTenantTab.getAttribute('aria-selected') === 'true';

      if (lessorActive) return 'lessor';
      if (tenantActive) return 'tenant';
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get FAQ questions count for specific tab
   */
  async getFAQQuestionsCountForTab(tab: 'lessor' | 'tenant'): Promise<number> {
    if (tab === 'lessor') {
      await this.switchToLessorFAQTab();
    } else {
      await this.switchToTenantFAQTab();
    }

    await this.page.waitForTimeout(300); // Wait for content to load
    return await this.faqQuestions.count();
  }

  /**
   * Check if FAQ item is expanded
   */
  async isFAQItemExpanded(index: number): Promise<boolean> {
    try {
      const faqItem = this.faqItems.nth(index);
      const expanded = await faqItem.getAttribute('data-state') === 'open' ||
                      await faqItem.getAttribute('aria-expanded') === 'true';
      return expanded;
    } catch {
      return false;
    }
  }

  /**
   * Click on FAQ item by index
   */
  async clickFAQItem(index: number): Promise<void> {
    const faqItem = this.faqItems.nth(index);
    await this.clickElement(faqItem);
    await this.page.waitForTimeout(300); // Wait for accordion animation
  }

  /**
   * Get FAQ question by index
   */
  async getFAQQuestion(index: number): Promise<string> {
    const faqItem = this.faqItems.nth(index);
    return await this.getText(faqItem.locator('h3, h4, .question'));
  }

  /**
   * Get FAQ answer by index
   */
  async getFAQAnswer(index: number): Promise<string> {
    const faqItem = this.faqItems.nth(index);
    return await this.getText(faqItem.locator('.answer, .content, [data-state="open"]'));
  }

  /**
   * Check if FAQ answer is visible
   */
  async isFAQAnswerVisible(index: number): Promise<boolean> {
    const faqItem = this.faqItems.nth(index);
    const answer = faqItem.locator('.answer, .content, [data-state="open"]');
    return await this.isElementVisible(answer);
  }

  /**
   * Get all FAQ questions
   */
  async getAllFAQQuestions(): Promise<string[]> {
    const count = await this.getFAQItemsCount();
    const questions: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const question = await this.getFAQQuestion(i);
      if (question.trim()) {
        questions.push(question.trim());
      }
    }
    
    return questions;
  }

  /**
   * Check if footer is visible
   */
  async isFooterVisible(): Promise<boolean> {
    return await this.isElementVisible(this.footer);
  }

  /**
   * Get footer links
   */
  async getFooterLinks(): Promise<string[]> {
    const links = this.footer.locator('a:not([href*="linkedin"]):not([href*="instagram"]):not([href*="twitter"]):not([href*="mailto"])');
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
   * Get social media links (returns URLs for consistency with getSocialLinksUrls)
   */
  async getSocialLinks(): Promise<string[]> {
    return await this.getSocialLinksUrls();
  }

  /**
   * Get contact information
   */
  async getContactInfo(): Promise<string> {
    return await this.getText(this.footerContactEmail);
  }

  /**
   * Get license number
   */
  async getLicenseNumber(): Promise<string> {
    const licenseElement = this.footer.locator(':has-text("License"), [class*="license"]');
    return await this.getText(licenseElement);
  }

  


  /**
   * Get footer contact email
   */
  async getFooterContactEmail(): Promise<string> {
    return await this.getText(this.footerContactEmail);
  }

  /**
   * Get social media links count
   */
  async getSocialLinksCount(): Promise<number> {
    return await this.footerSocialLinks.count();
  }

  /**
   * Get footer social media links URLs
   */
  async getSocialLinksUrls(): Promise<string[]> {
    const links = this.footerSocialLinks;
    const count = await links.count();
    const urls: string[] = [];

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href) {
        urls.push(href);
      }
    }

    return urls;
  }

  /**
   * Get process steps count
   */
  async getProcessStepsCount(): Promise<number> {
    return await this.processSteps.count();
  }

  /**
   * Get process step information
   */
  async getProcessStepInfo(index: number): Promise<{ title: string; description: string } | null> {
    const stepElement = this.processSteps.nth(index);

    if (!(await this.isElementVisible(stepElement))) {
      return null;
    }

    const title = await this.getText(stepElement.locator('h3, h4, .step-title'));
    const description = await this.getText(stepElement.locator('p, .step-description'));

    return { title, description };
  }

  /**
   * Get all process steps information
   */
  async getAllProcessStepsInfo(): Promise<{ title: string; description: string }[]> {
    const count = await this.getProcessStepsCount();
    const steps: { title: string; description: string }[] = [];

    for (let i = 0; i < count; i++) {
      const stepInfo = await this.getProcessStepInfo(i);
      if (stepInfo) {
        steps.push(stepInfo);
      }
    }

    return steps;
  }

  /**
   * Verify all main sections are present on the page
   */
  async verifyAllMainSectionsPresent(): Promise<boolean> {
    const sectionsPresent = await Promise.all([
      this.isElementVisible(this.heroSection),
      this.isElementVisible(this.rentInstallmentsSection),
      this.isElementVisible(this.trackOrdersSection),
      this.isElementVisible(this.promotionsSection),
      this.isElementVisible(this.faqSection),
      this.isElementVisible(this.footer)
    ]);

    return sectionsPresent.every(present => present);
  }

  /**
   * Verify section is in viewport after scrolling
   */
  async verifySectionInViewport(section: 'rent-installments' | 'track-orders' | 'promotions' | 'faq' | 'footer'): Promise<boolean> {
    let sectionElement: Locator;

    switch (section) {
      case 'rent-installments':
        sectionElement = this.rentInstallmentsSection;
        break;
      case 'track-orders':
        sectionElement = this.trackOrdersSection;
        break;
      case 'promotions':
        sectionElement = this.promotionsSection;
        break;
      case 'faq':
        sectionElement = this.faqSection;
        break;
      case 'footer':
        sectionElement = this.footer;
        break;
      default:
        return false;
    }

    return await this.isSectionInViewport(sectionElement);
  }

  /**
   * Check if a specific section is in viewport
   */
  async isSectionInViewport(sectionLocator: Locator): Promise<boolean> {
    try {
      const box = await sectionLocator.boundingBox();
      if (!box) return false;

      const viewport = this.page.viewportSize();
      if (!viewport) return false;

      return box.y >= 0 && box.y < viewport.height;
    } catch {
      return false;
    }
  }

  /**
   * Check if mobile navigation drawer is visible
   */
  async isMobileNavigationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.mobileNavigationDrawer);
  }

  /**
   * Open mobile navigation (typically for mobile viewports)
   */
  async openMobileNavigation(): Promise<void> {
    const mobileMenuButton = this.page.locator('button[aria-label*="menu"], .menu-button, .hamburger');
    if (await this.isElementVisible(mobileMenuButton)) {
      await this.clickElement(mobileMenuButton);
      await this.waitForElement(this.mobileNavigationDrawer);
    }
  }

  /**
   * Click footer apply button
   */
  async clickFooterApplyButton(): Promise<void> {
    await this.clickElement(this.footerApplyButton);
  }

  /**
   * Click footer register button
   */
  async clickFooterRegisterButton(): Promise<void> {
    await this.clickElement(this.footerRegisterButton);
  }

  /**
   * @deprecated Use clickFooterRegisterButton instead
   */
  async clickRegisterAsLessorButton(): Promise<void> {
    await this.clickElement(this.footerRegisterButton);
  }

  /**
   * @deprecated Use clickFooterApplyButton instead
   */
  async clickApplyNowFooterButton(): Promise<void> {
    await this.clickElement(this.footerApplyButton);
  }

  /**
   * Verify landing page elements are present
   */
  async verifyLandingPageElements(): Promise<void> {
    await this.waitForElement(this.heroSection);
    await this.waitForElement(this.navigationMenu);
  }

  /**
   * Take landing page screenshot
   */
  async takeLandingPageScreenshot(): Promise<void> {
    await this.takeScreenshot('landing-page');
  }

  /**
   * Scroll to specific section (legacy method for backward compatibility)
   */
  async scrollToSection(section: 'features' | 'steps' | 'dashboard' | 'faq' | 'footer' | 'rent-installments' | 'track-orders' | 'promotions'): Promise<void> {
    let sectionElement: Locator;

    switch (section) {
      case 'features':
      case 'steps':
      case 'rent-installments':
        sectionElement = this.rentInstallmentsSection;
        break;
      case 'dashboard':
      case 'track-orders':
        sectionElement = this.trackOrdersSection;
        break;
      case 'promotions':
        sectionElement = this.promotionsSection;
        break;
      case 'faq':
        sectionElement = this.faqSection;
        break;
      case 'footer':
        sectionElement = this.footer;
        break;
      default:
        throw new Error(`Unknown section: ${section}`);
    }

    await this.scrollToElement(sectionElement);
  }

  /**
   * Check if navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    return await this.isElementVisible(this.navigationMenu);
  }

  /**
   * Get navigation links
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
   * Refresh landing page
   */
  async refreshLandingPage(): Promise<void> {
    await this.reloadPage();
    await this.verifyLandingPageLoaded();
  }

  /**
   * Wait for landing page to load completely - optimized
   */
  async waitForLandingPageToLoad(): Promise<void> {
    await Promise.all([
      this.waitForElement(this.heroSection, { timeout: 3000 }),
      this.waitForElement(this.navigationMenu, { timeout: 3000 })
    ]);
    // Reduced dynamic content wait time
    await this.page.waitForTimeout(200);
  }
}
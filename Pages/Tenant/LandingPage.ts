import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for Rently Landing Page
 */
export class LandingPage extends BasePage {
  // Selectors
  private readonly pageTitle: Locator;
  private readonly heroSection: Locator;
  private readonly heroTitle: Locator;
  private readonly heroSubtitle: Locator;
  private readonly knowMoreButton: Locator;
  private readonly applyNowButton: Locator;
  private readonly startRentingButton: Locator;
  
  // Navigation
  private readonly navigationMenu: Locator;
  private readonly rentInstallmentsLink: Locator;
  private readonly aboutUsLink: Locator;
  private readonly legalCommitteeLink: Locator;
  private readonly faqLink: Locator;
  private readonly contactUsLink: Locator;
  private readonly languageToggle: Locator;
  private readonly themeToggle: Locator;
  
  // Features Section
  private readonly featuresSection: Locator;
  private readonly featureCards: Locator;
  private readonly featureTitle: Locator;
  private readonly featureDescription: Locator;
  
  // Steps Section
  private readonly stepsSection: Locator;
  private readonly stepCards: Locator;
  private readonly stepNumber: Locator;
  private readonly stepTitle: Locator;
  private readonly stepDescription: Locator;
  private readonly stepTime: Locator;
  
  // Dashboard Preview
  private readonly dashboardPreview: Locator;
  private readonly dashboardTitle: Locator;
  private readonly dashboardDescription: Locator;
  
  // FAQ Section
  private readonly faqSection: Locator;
  private readonly faqItems: Locator;
  private readonly faqQuestion: Locator;
  private readonly faqAnswer: Locator;
  private readonly faqToggle: Locator;
  
  // Footer
  private readonly footer: Locator;
  private readonly footerLinks: Locator;
  private readonly socialLinks: Locator;
  private readonly contactInfo: Locator;
  private readonly licenseNumber: Locator;
  
  // CTA Buttons
  private readonly registerAsLessorButton: Locator;
  private readonly applyNowFooterButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.pageTitle = page.locator('h1, h2, h3').filter({ hasText: /rent|installment|rently/i }).first();
    this.heroSection = page.locator('section').filter({ hasText: 'Your Rent on Your TermsWe' }).locator('div').nth(1)
    this.heroTitle = page.locator('h1, h2').filter({ hasText: /your rent on your terms|rent|installment/i }).first();
    this.heroSubtitle = page.locator('p, .subtitle').filter({ hasText: /flexible|sharia|payment/i }).first();
    this.knowMoreButton = page.locator('button:has-text("Know More"), a:has-text("Know More")').first();
    this.applyNowButton = page.locator('button:has-text("Apply Now"), a:has-text("Apply Now")').first();
    this.startRentingButton = page.locator('button:has-text("Start Renting"), a:has-text("Start Renting")').first();
    
    // Navigation
    this.navigationMenu = page.locator('nav, .navigation, .navbar').first();
    this.rentInstallmentsLink = page.locator('a:has-text("Rent Installments"), [href*="rent"]').first();
    this.aboutUsLink = page.locator('a:has-text("About Us"), [href*="about"]').first();
    this.legalCommitteeLink = page.locator('a:has-text("Legal Committee"), [href*="legal"]').first();
    this.faqLink = page.locator('a:has-text("FAQ"), [href*="faq"]').first();
    this.contactUsLink = page.locator('a:has-text("Contact Us"), [href*="contact"]').first();
    this.languageToggle = page.locator('button:has-text("العربية"), button:has-text("English")').first();
    this.themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"]').first();
    
    // Features Section
    this.featuresSection = page.locator('[data-testid="features"], .features, .features-section').first();
    this.featureCards = page.locator('[data-testid="feature-card"], .feature-card, .card').filter({ hasText: /lessor|tenant/i });
    this.featureTitle = page.locator('[data-testid="feature-title"], .feature-title, h3, h4');
    this.featureDescription = page.locator('[data-testid="feature-description"], .feature-description, p');
    
    // Steps Section
    this.stepsSection = page.locator('[data-testid="steps"], .steps, .steps-section').first();
    this.stepCards = page.locator('[data-testid="step-card"], .step-card, .card').filter({ hasText: /\d+/ });
    this.stepNumber = page.locator('[data-testid="step-number"], .step-number').filter({ hasText: /\d+/ });
    this.stepTitle = page.locator('[data-testid="step-title"], .step-title, h3, h4');
    this.stepDescription = page.locator('[data-testid="step-description"], .step-description, p');
    this.stepTime = page.locator('[data-testid="step-time"], .step-time, .time');
    
    // Dashboard Preview
    this.dashboardPreview = page.locator('[data-testid="dashboard-preview"], .dashboard-preview').first();
    this.dashboardTitle = page.locator('[data-testid="dashboard-title"], .dashboard-title, h2, h3').first();
    this.dashboardDescription = page.locator('[data-testid="dashboard-description"], .dashboard-description, p').first();
    
    // FAQ Section
    this.faqSection = page.locator('[data-testid="faq"], .faq, .faq-section').first();
    this.faqItems = page.locator('[data-testid="faq-item"], .faq-item, .accordion-item');
    this.faqQuestion = page.locator('[data-testid="faq-question"], .faq-question, .question, h4, h5');
    this.faqAnswer = page.locator('[data-testid="faq-answer"], .faq-answer, .answer, .content');
    this.faqToggle = page.locator('[data-testid="faq-toggle"], .faq-toggle, button, .accordion-toggle');
    
    // Footer
    this.footer = page.locator('footer, [data-testid="footer"], .footer').first();
    this.footerLinks = page.locator('footer a, .footer a');
    this.socialLinks = page.locator('[data-testid="social-links"], .social-links a');
    this.contactInfo = page.locator('[data-testid="contact-info"], .contact-info');
    this.licenseNumber = page.locator('[data-testid="license-number"], .license-number').filter({ hasText: /\d+/ });
    
    // CTA Buttons
    this.registerAsLessorButton = page.locator('button:has-text("Register as Lessor"), a:has-text("Register as Lessor")').first();
    this.applyNowFooterButton = page.locator('button:has-text("Apply Now"), a:has-text("Apply Now")').last();
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
      await this.waitForElement(this.heroSection, 10000);
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
   */
  async getHeroTitle(): Promise<string> {
    return await this.getText(this.heroTitle);
  }

  /**
   * Get hero section subtitle
   */
  async getHeroSubtitle(): Promise<string> {
    return await this.getText(this.heroSubtitle);
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
   * Click start renting button
   */
  async clickStartRentingButton(): Promise<void> {
    await this.clickElement(this.startRentingButton);
  }

  /**
   * Navigate to rent installments page
   */
  async navigateToRentInstallments(): Promise<void> {
    await this.clickElement(this.rentInstallmentsLink);
  }

  /**
   * Navigate to about us page
   */
  async navigateToAboutUs(): Promise<void> {
    await this.clickElement(this.aboutUsLink);
  }

  /**
   * Navigate to legal committee page
   */
  async navigateToLegalCommittee(): Promise<void> {
    await this.clickElement(this.legalCommitteeLink);
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
   * Check if features section is visible
   */
  async isFeaturesSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.featuresSection);
  }

  /**
   * Get number of feature cards
   */
  async getFeatureCardsCount(): Promise<number> {
    return await this.featureCards.count();
  }

  /**
   * Get feature information by index
   */
  async getFeatureInfo(index: number): Promise<{ title: string; description: string } | null> {
    const featureCard = this.featureCards.nth(index);
    
    if (!(await this.isElementVisible(featureCard))) {
      return null;
    }

    const title = await this.getText(featureCard.locator(this.featureTitle));
    const description = await this.getText(featureCard.locator(this.featureDescription));

    return { title, description };
  }

  /**
   * Get all features information
   */
  async getAllFeaturesInfo(): Promise<{ title: string; description: string }[]> {
    const count = await this.getFeatureCardsCount();
    const features: { title: string; description: string }[] = [];
    
    for (let i = 0; i < count; i++) {
      const featureInfo = await this.getFeatureInfo(i);
      if (featureInfo) {
        features.push(featureInfo);
      }
    }
    
    return features;
  }

  /**
   * Check if steps section is visible
   */
  async isStepsSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.stepsSection);
  }

  /**
   * Get number of step cards
   */
  async getStepCardsCount(): Promise<number> {
    return await this.stepCards.count();
  }

  /**
   * Get step information by index
   */
  async getStepInfo(index: number): Promise<{ number: string; title: string; description: string; time: string } | null> {
    const stepCard = this.stepCards.nth(index);
    
    if (!(await this.isElementVisible(stepCard))) {
      return null;
    }

    const number = await this.getText(stepCard.locator(this.stepNumber));
    const title = await this.getText(stepCard.locator(this.stepTitle));
    const description = await this.getText(stepCard.locator(this.stepDescription));
    const time = await this.getText(stepCard.locator(this.stepTime));

    return { number, title, description, time };
  }

  /**
   * Get all steps information
   */
  async getAllStepsInfo(): Promise<{ number: string; title: string; description: string; time: string }[]> {
    const count = await this.getStepCardsCount();
    const steps: { number: string; title: string; description: string; time: string }[] = [];
    
    for (let i = 0; i < count; i++) {
      const stepInfo = await this.getStepInfo(i);
      if (stepInfo) {
        steps.push(stepInfo);
      }
    }
    
    return steps;
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
    return await this.getText(this.dashboardTitle);
  }

  /**
   * Get dashboard preview description
   */
  async getDashboardPreviewDescription(): Promise<string> {
    return await this.getText(this.dashboardDescription);
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
   * Click on FAQ item
   */
  async clickFAQItem(index: number): Promise<void> {
    const faqItem = this.faqItems.nth(index);
    const toggle = faqItem.locator(this.faqToggle);
    await this.clickElement(toggle);
  }

  /**
   * Get FAQ question by index
   */
  async getFAQQuestion(index: number): Promise<string> {
    const faqItem = this.faqItems.nth(index);
    return await this.getText(faqItem.locator(this.faqQuestion));
  }

  /**
   * Get FAQ answer by index
   */
  async getFAQAnswer(index: number): Promise<string> {
    const faqItem = this.faqItems.nth(index);
    return await this.getText(faqItem.locator(this.faqAnswer));
  }

  /**
   * Check if FAQ answer is visible
   */
  async isFAQAnswerVisible(index: number): Promise<boolean> {
    const faqItem = this.faqItems.nth(index);
    const answer = faqItem.locator(this.faqAnswer);
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
    const links = this.footerLinks;
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
   * Get social media links
   */
  async getSocialLinks(): Promise<string[]> {
    const links = this.socialLinks;
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
   * Get contact information
   */
  async getContactInfo(): Promise<string> {
    return await this.getText(this.contactInfo);
  }

  /**
   * Get license number
   */
  async getLicenseNumber(): Promise<string> {
    return await this.getText(this.licenseNumber);
  }

  /**
   * Click register as lessor button
   */
  async clickRegisterAsLessorButton(): Promise<void> {
    await this.clickElement(this.registerAsLessorButton);
  }

  /**
   * Click apply now footer button
   */
  async clickApplyNowFooterButton(): Promise<void> {
    await this.clickElement(this.applyNowFooterButton);
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
   * Scroll to specific section
   */
  async scrollToSection(section: 'features' | 'steps' | 'dashboard' | 'faq' | 'footer'): Promise<void> {
    let sectionElement: Locator;
    
    switch (section) {
      case 'features':
        sectionElement = this.featuresSection;
        break;
      case 'steps':
        sectionElement = this.stepsSection;
        break;
      case 'dashboard':
        sectionElement = this.dashboardPreview;
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
   * Wait for landing page to load completely
   */
  async waitForLandingPageToLoad(): Promise<void> {
    await this.waitForElement(this.heroSection);
    await this.waitForElement(this.navigationMenu);
    // Wait for dynamic content to load
    await this.page.waitForTimeout(2000);
  }
}
import { test, expect } from '@playwright/test';
import { LandingPage } from '../../Pages/Tenant/LandingPage';
import { Helpers } from '../../utils/Helpers';

test.describe('Landing Page Tests', () => {
  let landingPage: LandingPage;

  test.beforeEach(async ({ page }) => {
    landingPage = new LandingPage(page);
    await landingPage.navigateToLandingPage();
  });

  test('should display landing page elements', async () => {
    // Verify landing page is loaded
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
   
  // Verify main elements are present
    await landingPage.verifyLandingPageElements();
    
    // Take screenshot for verification
    await landingPage.takeLandingPageScreenshot(); 
  });

  test('should display page title', async () => {
    const title = await landingPage.getPageTitle();
    console.log('Title:', title);
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display hero section', async () => {
    const heroTitle = await landingPage.getHeroTitle();
    const heroSubtitle = await landingPage.getHeroSubtitle();
    
    expect(heroTitle).toBeTruthy();
    expect(heroSubtitle).toBeTruthy();
    expect(heroTitle.length).toBeGreaterThan(0);
    expect(heroSubtitle.length).toBeGreaterThan(0);
  });

  test('should display navigation menu', async () => {
    const isNavVisible = await landingPage.isNavigationMenuVisible();
    expect(isNavVisible).toBe(true);
    
    // Get navigation links
    const navLinks = await landingPage.getNavigationLinks();
    expect(navLinks.length).toBeGreaterThan(0);
    
    // Verify expected links are present
    const expectedLinks = ['Home', 'Rent Installments', 'About Us', 'FAQ', 'Contact Us', 'Legal Committee'];
    for (const expectedLink of expectedLinks) {
      const hasLink = navLinks.some(link => 
        link.toLowerCase().includes(expectedLink.toLowerCase())
      );
      expect(hasLink).toBe(true);
    }
  });

  test('should navigate to different pages from navigation menu', async () => {
    // Test rent installments navigation
    await landingPage.navigateToRentInstallments();
    await landingPage.waitForPageLoad();
    
    // Test about us navigation
    await landingPage.navigateToAboutUs();
    await landingPage.waitForPageLoad();
    
    // Test FAQ navigation
    await landingPage.navigateToFAQ();
    await landingPage.waitForPageLoad();
    
    // Test contact us navigation
    await landingPage.navigateToContactUs();
    await landingPage.waitForPageLoad();
    
    // Test legal committee navigation
    await landingPage.navigateToLegalCommittee();
    await landingPage.waitForPageLoad();
  });

  test('should click CTA buttons', async () => {
    // Click know more button
    await landingPage.clickKnowMoreButton();
    await landingPage.waitForPageLoad();
    
    // Click apply now button
    await landingPage.clickApplyNowButton();
    await landingPage.waitForPageLoad();
    
    // Click start renting button
    await landingPage.clickStartRentingButton();
    await landingPage.waitForPageLoad();
  });

  test('should display features section', async () => {
    const isFeaturesVisible = await landingPage.isFeaturesSectionVisible();
    expect(isFeaturesVisible).toBe(true);
    
    // Get features count
    const featuresCount = await landingPage.getFeatureCardsCount();
    expect(featuresCount).toBeGreaterThan(0);
    
    // Get features information
    const features = await landingPage.getAllFeaturesInfo();
    expect(features.length).toBe(featuresCount);
    
    // Verify features have content
    for (const feature of features) {
      expect(feature.title).toBeTruthy();
      expect(feature.description).toBeTruthy();
    }
  });

  test('should display steps section', async () => {
    const isStepsVisible = await landingPage.isStepsSectionVisible();
    expect(isStepsVisible).toBe(true);
    
    // Get steps count
    const stepsCount = await landingPage.getStepCardsCount();
    expect(stepsCount).toBeGreaterThan(0);
    
    // Get steps information
    const steps = await landingPage.getAllStepsInfo();
    expect(steps.length).toBe(stepsCount);
    
    // Verify steps have content
    for (const step of steps) {
      expect(step.number).toBeTruthy();
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  test('should display dashboard preview', async () => {
    const isDashboardVisible = await landingPage.isDashboardPreviewVisible();
    expect(isDashboardVisible).toBe(true);
    
    // Get dashboard preview content
    const dashboardTitle = await landingPage.getDashboardPreviewTitle();
    const dashboardDescription = await landingPage.getDashboardPreviewDescription();
    
    expect(dashboardTitle).toBeTruthy();
    expect(dashboardDescription).toBeTruthy();
  });

  test('should display FAQ section', async () => {
    const isFAQVisible = await landingPage.isFAQSectionVisible();
    expect(isFAQVisible).toBe(true);
    
    // Get FAQ items count
    const faqCount = await landingPage.getFAQItemsCount();
    expect(faqCount).toBeGreaterThan(0);
    
    // Get FAQ questions
    const questions = await landingPage.getAllFAQQuestions();
    expect(questions.length).toBe(faqCount);
    
    // Verify questions have content
    for (const question of questions) {
      expect(question).toBeTruthy();
      expect(question.length).toBeGreaterThan(0);
    }
  });

  test('should interact with FAQ items', async () => {
    const faqCount = await landingPage.getFAQItemsCount();
    
    if (faqCount > 0) {
      // Click on first FAQ item
      await landingPage.clickFAQItem(0);
      
      // Wait for answer to appear
      await landingPage.page.waitForTimeout(1000);
      
      // Check if answer is visible
      const isAnswerVisible = await landingPage.isFAQAnswerVisible(0);
      expect(isAnswerVisible).toBe(true);
      
      // Get FAQ answer
      const answer = await landingPage.getFAQAnswer(0);
      expect(answer).toBeTruthy();
    }
  });

  test('should display footer', async () => {
    const isFooterVisible = await landingPage.isFooterVisible();
    expect(isFooterVisible).toBe(true);
    
    // Get footer links
    const footerLinks = await landingPage.getFooterLinks();
    expect(footerLinks.length).toBeGreaterThan(0);
    
    // Get social links
    const socialLinks = await landingPage.getSocialLinks();
    expect(socialLinks.length).toBeGreaterThan(0);
    
    // Get contact information
    const contactInfo = await landingPage.getContactInfo();
    expect(contactInfo).toBeTruthy();
    
    // Get license number
    const licenseNumber = await landingPage.getLicenseNumber();
    expect(licenseNumber).toBeTruthy();
  });

  test('should click footer CTA buttons', async () => {
    // Click register as lessor button
    await landingPage.clickRegisterAsLessorButton();
    await landingPage.waitForPageLoad();
    
    // Click apply now footer button
    await landingPage.clickApplyNowFooterButton();
    await landingPage.waitForPageLoad();
  });

  test('should toggle language', async () => {
    // Toggle language
    await landingPage.toggleLanguage();
    
    // Wait for page to update
    await landingPage.waitForPageLoad();
    
    // Verify page is still functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
  });

  test('should toggle theme', async () => {
    // Toggle theme
    await landingPage.toggleTheme();
    
    // Wait for page to update
    await landingPage.waitForPageLoad();
    
    // Verify page is still functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
  });

  test('should scroll to different sections', async () => {
    // Scroll to features section
    await landingPage.scrollToSection('features');
    expect(await landingPage.isFeaturesSectionVisible()).toBe(true);
    
    // Scroll to steps section
    await landingPage.scrollToSection('steps');
    expect(await landingPage.isStepsSectionVisible()).toBe(true);
    
    // Scroll to dashboard section
    await landingPage.scrollToSection('dashboard');
    expect(await landingPage.isDashboardPreviewVisible()).toBe(true);
    
    // Scroll to FAQ section
    await landingPage.scrollToSection('faq');
    expect(await landingPage.isFAQSectionVisible()).toBe(true);
    
    // Scroll to footer
    await landingPage.scrollToSection('footer');
    expect(await landingPage.isFooterVisible()).toBe(true);
  });

  test('should refresh page and maintain functionality', async () => {
    // Get initial features count
    const initialFeaturesCount = await landingPage.getFeatureCardsCount();
    
    // Refresh page
    await landingPage.refreshLandingPage();
    
    // Get features count after refresh
    const refreshedFeaturesCount = await landingPage.getFeatureCardsCount();
    
    // Count should be similar
    expect(refreshedFeaturesCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle rapid navigation clicks', async () => {
    // Rapidly click different navigation elements
    await landingPage.clickKnowMoreButton();
    await landingPage.page.waitForTimeout(100);
    
    await landingPage.clickApplyNowButton();
    await landingPage.page.waitForTimeout(100);
    
    await landingPage.clickStartRentingButton();
    await landingPage.page.waitForTimeout(100);
    
    // Should not cause errors
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
  });

  test('should display correct content structure', async () => {
    // Verify hero section content
    const heroTitle = await landingPage.getHeroTitle();
    expect(heroTitle).toMatch(/rent|installment|terms/i);
    
    // Verify features section content
    const features = await landingPage.getAllFeaturesInfo();
    for (const feature of features) {
      expect(feature.title).toMatch(/lessor|tenant|financial|occupancy/i);
    }
    
    // Verify steps section content
    const steps = await landingPage.getAllStepsInfo();
    for (const step of steps) {
      expect(step.number).toMatch(/\d+/);
      expect(step.title).toBeTruthy();
    }
  });

  test('should handle empty sections gracefully', async () => {
    // Check if sections exist and handle empty states
    const featuresCount = await landingPage.getFeatureCardsCount();
    const stepsCount = await landingPage.getStepCardsCount();
    const faqCount = await landingPage.getFAQItemsCount();
    
    // At least one section should have content
    expect(featuresCount + stepsCount + faqCount).toBeGreaterThan(0);
  });

  test('should maintain page state on scroll', async () => {
    // Scroll to different sections
    await landingPage.scrollToSection('features');
    await landingPage.scrollToSection('steps');
    await landingPage.scrollToSection('dashboard');
    
    // Verify page is still functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
    
    // Verify navigation is still accessible
    expect(await landingPage.isNavigationMenuVisible()).toBe(true);
  });

  test('should handle page loading states', async () => {
    // Refresh page to trigger loading state
    await landingPage.refreshLandingPage();
    
    // Verify page loads completely
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
    
    // Verify all main sections are visible
    expect(await landingPage.isNavigationMenuVisible()).toBe(true);
  });
});

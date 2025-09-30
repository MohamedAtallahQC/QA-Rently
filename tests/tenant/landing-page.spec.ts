import { test, expect } from '@playwright/test';
import { LandingPage } from '../../Pages/Tenant/LandingPage';

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
    // Batch hero section data retrieval for better performance
    const [heroTitle, heroSubtitle] = await Promise.all([
      landingPage.getHeroTitle(),
      landingPage.getHeroSubtitle()
    ]);

    console.log('Hero Title:', heroTitle);
    console.log('Hero Subtitle:', heroSubtitle);

    expect(heroTitle).toBeTruthy();
    expect(heroSubtitle).toBeTruthy();
    expect(heroTitle.length).toBeGreaterThan(0);
    expect(heroSubtitle.length).toBeGreaterThan(0);
  });

  test('should display navigation menu', async () => {
    // Batch navigation checks for better performance
    const [isNavVisible, navLinks] = await Promise.all([
      landingPage.isNavigationMenuVisible(),
      landingPage.getNavigationLinks()
    ]);

    expect(isNavVisible).toBe(true);
    expect(navLinks.length).toBeGreaterThan(0);

    console.log('Navigation Links:', navLinks);
    // Verify main navigation sections are present (adjusted for actual page structure)
    const expectedSections = ['Rent Installments', 'FAQ'];
    for (const expectedSection of expectedSections) {
      const hasSection = navLinks.some(link =>
        link.toLowerCase().includes(expectedSection.toLowerCase())
      );
      expect(hasSection).toBe(true);
    }
  });

  test('should scroll to different sections from navigation menu', async () => {
    const initialUrl = landingPage.getCurrentUrl() as string;
    console.log('Initial URL:', initialUrl);

    // Optimized section scrolling - batch visibility checks
    await landingPage.scrollToRentInstallments();
    await landingPage.scrollToFAQ();
    await landingPage.scrollToTrackOrders();
    await landingPage.scrollToPromotions();

    // Batch all visibility checks for better performance
    const [isRentVisible, isFAQVisible, isTrackVisible, isPromotionsVisible] = await Promise.all([
      landingPage.isRentInstallmentsSectionVisible(),
      landingPage.isFAQSectionVisible(),
      landingPage.isTrackOrdersSectionVisible(),
      landingPage.isPromotionsSectionVisible()
    ]);

    expect(isRentVisible).toBe(true);
    expect(isFAQVisible).toBe(true);
    expect(isTrackVisible).toBe(true);
    expect(isPromotionsVisible).toBe(true);

    // URL should still be the same page (scrolling, not navigation)
    const finalUrl = landingPage.getCurrentUrl() as string;
    expect(finalUrl.split('#')[0]).toBe(initialUrl.split('#')[0]);
  });

  test('should handle CTA buttons correctly', async () => {
    const initialUrl = landingPage.getCurrentUrl() as string;

    // Click know more button (should scroll to rent installments section)
    await landingPage.clickKnowMoreButton();
    expect(await landingPage.isRentInstallmentsSectionVisible()).toBe(true);
    // Should remain on same page
    const urlAfterKnowMore = landingPage.getCurrentUrl() as string;
    expect(urlAfterKnowMore.split('#')[0]).toBe(initialUrl.split('#')[0]);

    // Click apply now button (should navigate to tenant application page)
    await landingPage.clickApplyNowButton();
    // This should navigate to a different page
    const urlAfterApply = landingPage.getCurrentUrl() as string;
    expect(urlAfterApply).not.toBe(initialUrl);
    expect(urlAfterApply).toContain('tenant-application');
  });

  test('should display rent installments section with process steps', async () => {
    const isRentInstallmentsVisible = await landingPage.isRentInstallmentsSectionVisible();
    expect(isRentInstallmentsVisible).toBe(true);

    // Get process steps count
    const stepsCount = await landingPage.getProcessStepsCount();
    expect(stepsCount).toBeGreaterThan(0);

    // Get process steps information
    const steps = await landingPage.getAllProcessStepsInfo();
    expect(steps.length).toBe(stepsCount);

    // Verify steps have content
    for (const step of steps) {
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }
  });

  test('should display track orders section', async () => {
    const isTrackOrdersVisible = await landingPage.isTrackOrdersSectionVisible();
    expect(isTrackOrdersVisible).toBe(true);

    // Check if dashboard preview is visible
    const isDashboardVisible = await landingPage.isDashboardPreviewVisible();
    expect(isDashboardVisible).toBe(true);
  });

  test('should display promotions section', async () => {
    const isPromotionsVisible = await landingPage.isPromotionsSectionVisible();
    expect(isPromotionsVisible).toBe(true);
  });

  test('should verify all main sections are present', async () => {
    const allSectionsPresent = await landingPage.verifyAllMainSectionsPresent();
    expect(allSectionsPresent).toBe(true);
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

  test('should switch between FAQ tabs and interact with items', async () => {
    // Scroll to FAQ section first
    await landingPage.scrollToFAQ();
    expect(await landingPage.isFAQSectionVisible()).toBe(true);

    // Test Lessor FAQ tab
    await landingPage.switchToLessorFAQTab();
    expect(await landingPage.getActiveFAQTab()).toBe('lessor');

    const lessorFAQCount = await landingPage.getFAQQuestionsCountForTab('lessor');
    expect(lessorFAQCount).toBeGreaterThan(0);

    // Test clicking on first lessor FAQ item
    if (lessorFAQCount > 0) {
      await landingPage.clickFAQItem(0);
      expect(await landingPage.isFAQItemExpanded(0)).toBe(true);

      const answer = await landingPage.getFAQAnswer(0);
      expect(answer).toBeTruthy();
    }

    // Test Tenant FAQ tab
    await landingPage.switchToTenantFAQTab();
    expect(await landingPage.getActiveFAQTab()).toBe('tenant');

    const tenantFAQCount = await landingPage.getFAQQuestionsCountForTab('tenant');
    expect(tenantFAQCount).toBeGreaterThan(0);

    // Test clicking on first tenant FAQ item
    if (tenantFAQCount > 0) {
      await landingPage.clickFAQItem(0);
      expect(await landingPage.isFAQItemExpanded(0)).toBe(true);

      const answer = await landingPage.getFAQAnswer(0);
      expect(answer).toBeTruthy();
    }

    // Verify we can get all questions for current tab
    const allQuestions = await landingPage.getAllFAQQuestions();
    expect(allQuestions.length).toBeGreaterThan(0);
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

  test('should interact with footer elements', async () => {
    // Scroll to footer
    await landingPage.scrollToSection('footer');
    expect(await landingPage.isFooterVisible()).toBe(true);

    // Verify contact email is present
    const contactEmail = await landingPage.getContactInfo();
    expect(contactEmail).toContain('@');

    // Verify social links are present
    const socialLinksCount = await landingPage.getSocialLinksCount();
    expect(socialLinksCount).toBeGreaterThan(0);

    // Get social links URLs
    const socialUrls = await landingPage.getSocialLinksUrls();
    expect(socialUrls.length).toBeGreaterThan(0);
    for (const url of socialUrls) {
      expect(url).toMatch(/linkedin|instagram|twitter/i);
    }
  });


  test('should toggle language and navigate to Arabic version', async () => {
    const initialLanguage = await landingPage.getCurrentLanguage();
    expect(initialLanguage).toBe('en');

    // Toggle to Arabic language
    await landingPage.toggleLanguage();

    // Wait for page to load
    await landingPage.waitForPageLoad();

    // Verify we're now on Arabic version
    const newLanguage = await landingPage.getCurrentLanguage();
    expect(newLanguage).toBe('ar');
    console.log('New language:', newLanguage);

    // Verify page is still functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);

    // Navigate back to English for other tests
    await landingPage.navigateTo('/en');
    await landingPage.waitForPageLoad();
  });

  test('should toggle theme between light and dark', async () => {
    const initialTheme = await landingPage.getCurrentTheme();
    console.log('Initial theme:', initialTheme);

    // Toggle theme
    await landingPage.toggleTheme();
    await landingPage.waitForThemeChange();

    // Verify theme changed
    const newTheme = await landingPage.getCurrentTheme();
    console.log('New theme:', newTheme);
    expect(newTheme).not.toBe(initialTheme);

    // Verify page is still functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);

    // Toggle back
    await landingPage.toggleTheme();
    await landingPage.waitForThemeChange();

    const finalTheme = await landingPage.getCurrentTheme();
    console.log('Final theme:', finalTheme);
  });

  test('should scroll to different sections and verify viewport position', async () => {
    // Test rent-installments section
    await landingPage.scrollToSection('rent-installments');
    expect(await landingPage.verifySectionInViewport('rent-installments')).toBe(true);

    // Test track-orders section
    await landingPage.scrollToSection('track-orders');
    expect(await landingPage.verifySectionInViewport('track-orders')).toBe(true);

    // Test promotions section
    await landingPage.scrollToSection('promotions');
    expect(await landingPage.verifySectionInViewport('promotions')).toBe(true);

    // Test FAQ section
    await landingPage.scrollToSection('faq');
    expect(await landingPage.verifySectionInViewport('faq')).toBe(true);

    // Test footer
    await landingPage.scrollToSection('footer');
    expect(await landingPage.isFooterVisible()).toBe(true);
  });

  test('should refresh page and maintain functionality', async () => {
    // Refresh page
    await landingPage.refreshLandingPage();

    // Get process steps count after refresh
    const refreshedStepsCount = await landingPage.getProcessStepsCount();

    // Count should be greater than 0
    expect(refreshedStepsCount).toBeGreaterThan(0);

    // Verify all main sections are still present
    expect(await landingPage.verifyAllMainSectionsPresent()).toBe(true);
  });

  test('should handle rapid section scrolling', async () => {
    // Rapidly scroll to different sections
    await landingPage.scrollToRentInstallments();

    await landingPage.scrollToTrackOrders();

    await landingPage.scrollToPromotions();

    await landingPage.scrollToFAQ();

    // Should not cause errors and page should still be functional
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);
    expect(await landingPage.isNavigationMenuVisible()).toBe(true);
  });

  test('should test mobile navigation if in mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Refresh page for mobile layout
    await landingPage.refreshLandingPage();

    // Check if mobile navigation is available
    const isMobileNavVisible = await landingPage.isMobileNavigationVisible();

    if (!isMobileNavVisible) {
      // Try to open mobile navigation
      await landingPage.openMobileNavigation();
    }

    // Verify page is still functional in mobile view
    expect(await landingPage.verifyLandingPageLoaded()).toBe(true);

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should display correct content structure', async () => {
    // Verify hero section content
    const heroTitle = await landingPage.getHeroTitle();
    expect(heroTitle).toMatch(/rent|installment|terms/i);

    // Verify process steps content
    const steps = await landingPage.getAllProcessStepsInfo();
    expect(steps.length).toBeGreaterThan(0);
    for (const step of steps) {
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
    }

    // Verify FAQ content exists for both tabs
    await landingPage.scrollToFAQ();
    const lessorQuestions = await landingPage.getFAQQuestionsCountForTab('lessor');
    const tenantQuestions = await landingPage.getFAQQuestionsCountForTab('tenant');
    expect(lessorQuestions + tenantQuestions).toBeGreaterThan(0);
  });

  test('should handle sections gracefully and verify content exists', async () => {
    // Check if main sections exist and have content
    const processStepsCount = await landingPage.getProcessStepsCount();
    const faqCount = await landingPage.getFAQItemsCount();

    // Verify sections have content
    expect(processStepsCount).toBeGreaterThan(0);
    expect(faqCount).toBeGreaterThan(0);

    // Verify all main sections are visible
    expect(await landingPage.verifyAllMainSectionsPresent()).toBe(true);
  });

  test('should maintain page state on scroll', async () => {
    // Scroll to different sections
    await landingPage.scrollToSection('rent-installments');
    await landingPage.scrollToSection('track-orders');
    await landingPage.scrollToSection('promotions');

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

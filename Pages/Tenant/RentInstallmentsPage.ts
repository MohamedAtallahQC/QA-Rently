import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { PropertyInfo } from '../../utils/TestData';

/**
 * Page Object Model for Rent Installments Page
 */
export class RentInstallmentsPage extends BasePage {
  // Selectors
  private readonly pageTitle: Locator;
  private readonly propertySearchInput: Locator;
  private readonly propertyTypeSelect: Locator;
  private readonly citySelect: Locator;
  private readonly minRentInput: Locator;
  private readonly maxRentInput: Locator;
  private readonly searchButton: Locator;
  private readonly propertyCards: Locator;
  private readonly propertyTitle: Locator;
  private readonly propertyAddress: Locator;
  private readonly propertyRent: Locator;
  private readonly propertyType: Locator;
  private readonly propertyBedrooms: Locator;
  private readonly propertyBathrooms: Locator;
  private readonly viewDetailsButton: Locator;
  private readonly applyForRentButton: Locator;
  private readonly filterButton: Locator;
  private readonly sortSelect: Locator;
  private readonly pagination: Locator;
  private readonly nextPageButton: Locator;
  private readonly previousPageButton: Locator;
  private readonly pageNumbers: Locator;
  private readonly noResultsMessage: Locator;
  private readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize selectors
    this.pageTitle = page.locator('h1, h2').filter({ hasText: /rent|installment|property/i }).first();
    this.propertySearchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"], input[type="search"]').first();
    this.propertyTypeSelect = page.locator('select[name*="type"], select[name*="property"]').first();
    this.citySelect = page.locator('select[name*="city"], select[name*="location"]').first();
    this.minRentInput = page.locator('input[name*="min"], input[placeholder*="min"]').first();
    this.maxRentInput = page.locator('input[name*="max"], input[placeholder*="max"]').first();
    this.searchButton = page.locator('button:has-text("Search"), button[type="submit"]').first();
    this.propertyCards = page.locator('[data-testid="property-card"], .property-card, .card').filter({ hasText: /rent|property/i });
    this.propertyTitle = page.locator('[data-testid="property-title"], .property-title, h3, h4');
    this.propertyAddress = page.locator('[data-testid="property-address"], .property-address, .address');
    this.propertyRent = page.locator('[data-testid="property-rent"], .property-rent, .rent, .price');
    this.propertyType = page.locator('[data-testid="property-type"], .property-type, .type');
    this.propertyBedrooms = page.locator('[data-testid="bedrooms"], .bedrooms, .beds');
    this.propertyBathrooms = page.locator('[data-testid="bathrooms"], .bathrooms, .baths');
    this.viewDetailsButton = page.locator('button:has-text("View Details"), a:has-text("View Details")');
    this.applyForRentButton = page.locator('button:has-text("Apply"), button:has-text("Apply for Rent")');
    this.filterButton = page.locator('button:has-text("Filter"), [data-testid="filter"]').first();
    this.sortSelect = page.locator('select[name*="sort"], select[name*="order"]').first();
    this.pagination = page.locator('[data-testid="pagination"], .pagination').first();
    this.nextPageButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
    this.previousPageButton = page.locator('button:has-text("Previous"), a:has-text("Previous")').first();
    this.pageNumbers = page.locator('[data-testid="page-number"], .page-number');
    this.noResultsMessage = page.locator('[data-testid="no-results"], .no-results, .empty-state').first();
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner').first();
  }

  /**
   * Navigate to rent installments page
   */
  async navigateToRentInstallments(): Promise<void> {
    await this.navigateTo('/rent-installments');
    await this.waitForPageLoad();
  }

  /**
   * Verify page is loaded
   */
  async verifyPageLoaded(): Promise<boolean> {
    try {
      await this.waitForElement(this.pageTitle, 10000);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  /**
   * Search for properties
   */
  async searchProperties(searchTerm: string): Promise<void> {
    await this.fillInput(this.propertySearchInput, searchTerm);
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Filter properties by type
   */
  async filterByPropertyType(propertyType: string): Promise<void> {
    await this.selectOption(this.propertyTypeSelect, propertyType);
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Filter properties by city
   */
  async filterByCity(city: string): Promise<void> {
    await this.selectOption(this.citySelect, city);
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Filter properties by rent range
   */
  async filterByRentRange(minRent: number, maxRent: number): Promise<void> {
    await this.fillInput(this.minRentInput, minRent.toString());
    await this.fillInput(this.maxRentInput, maxRent.toString());
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Apply all filters
   */
  async applyFilters(filters: {
    searchTerm?: string;
    propertyType?: string;
    city?: string;
    minRent?: number;
    maxRent?: number;
  }): Promise<void> {
    if (filters.searchTerm) {
      await this.fillInput(this.propertySearchInput, filters.searchTerm);
    }
    
    if (filters.propertyType) {
      await this.selectOption(this.propertyTypeSelect, filters.propertyType);
    }
    
    if (filters.city) {
      await this.selectOption(this.citySelect, filters.city);
    }
    
    if (filters.minRent) {
      await this.fillInput(this.minRentInput, filters.minRent.toString());
    }
    
    if (filters.maxRent) {
      await this.fillInput(this.maxRentInput, filters.maxRent.toString());
    }
    
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    await this.fillInput(this.propertySearchInput, '');
    await this.fillInput(this.minRentInput, '');
    await this.fillInput(this.maxRentInput, '');
    // Reset selects to default values
    await this.selectOption(this.propertyTypeSelect, '');
    await this.selectOption(this.citySelect, '');
    await this.clickElement(this.searchButton);
    await this.waitForLoadingToComplete();
  }

  /**
   * Get number of property cards
   */
  async getPropertyCardsCount(): Promise<number> {
    return await this.propertyCards.count();
  }

  /**
   * Get property information by index
   */
  async getPropertyInfo(index: number): Promise<PropertyInfo | null> {
    const propertyCard = this.propertyCards.nth(index);
    
    if (!(await this.isElementVisible(propertyCard))) {
      return null;
    }

    const title = await this.getText(propertyCard.locator(this.propertyTitle));
    const address = await this.getText(propertyCard.locator(this.propertyAddress));
    const rentText = await this.getText(propertyCard.locator(this.propertyRent));
    const type = await this.getText(propertyCard.locator(this.propertyType));
    
    // Extract rent amount from text (remove currency symbols and commas)
    const rentAmount = parseInt(rentText.replace(/[^\d]/g, '')) || 0;
    
    // Extract bedrooms and bathrooms if available
    const bedroomsText = await this.getText(propertyCard.locator(this.propertyBedrooms));
    const bathroomsText = await this.getText(propertyCard.locator(this.propertyBathrooms));
    const bedrooms = parseInt(bedroomsText.replace(/[^\d]/g, '')) || undefined;
    const bathrooms = parseInt(bathroomsText.replace(/[^\d]/g, '')) || undefined;

    return {
      address: address || '',
      city: '', // Will be extracted from address if needed
      rentAmount,
      propertyType: type || '',
      bedrooms,
      bathrooms
    };
  }

  /**
   * Get all property information
   */
  async getAllPropertiesInfo(): Promise<PropertyInfo[]> {
    const count = await this.getPropertyCardsCount();
    const properties: PropertyInfo[] = [];
    
    for (let i = 0; i < count; i++) {
      const propertyInfo = await this.getPropertyInfo(i);
      if (propertyInfo) {
        properties.push(propertyInfo);
      }
    }
    
    return properties;
  }

  /**
   * Click on property card
   */
  async clickPropertyCard(index: number): Promise<void> {
    const propertyCard = this.propertyCards.nth(index);
    await this.clickElement(propertyCard);
  }

  /**
   * Click view details button for specific property
   */
  async clickViewDetails(index: number): Promise<void> {
    const propertyCard = this.propertyCards.nth(index);
    const viewDetailsBtn = propertyCard.locator(this.viewDetailsButton);
    await this.clickElement(viewDetailsBtn);
  }

  /**
   * Click apply for rent button for specific property
   */
  async clickApplyForRent(index: number): Promise<void> {
    const propertyCard = this.propertyCards.nth(index);
    const applyBtn = propertyCard.locator(this.applyForRentButton);
    await this.clickElement(applyBtn);
  }

  /**
   * Sort properties
   */
  async sortProperties(sortOption: string): Promise<void> {
    await this.selectOption(this.sortSelect, sortOption);
    await this.waitForLoadingToComplete();
  }

  /**
   * Go to next page
   */
  async goToNextPage(): Promise<void> {
    if (await this.isElementVisible(this.nextPageButton)) {
      await this.clickElement(this.nextPageButton);
      await this.waitForLoadingToComplete();
    }
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage(): Promise<void> {
    if (await this.isElementVisible(this.previousPageButton)) {
      await this.clickElement(this.previousPageButton);
      await this.waitForLoadingToComplete();
    }
  }

  /**
   * Go to specific page
   */
  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.pageNumbers.filter({ hasText: pageNumber.toString() }).first();
    if (await this.isElementVisible(pageButton)) {
      await this.clickElement(pageButton);
      await this.waitForLoadingToComplete();
    }
  }

  /**
   * Check if pagination is visible
   */
  async isPaginationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.pagination);
  }

  /**
   * Get current page number
   */
  async getCurrentPageNumber(): Promise<number> {
    const activePage = this.pageNumbers.filter({ hasText: /active|current/ }).first();
    if (await this.isElementVisible(activePage)) {
      const pageText = await this.getText(activePage);
      return parseInt(pageText.replace(/[^\d]/g, '')) || 1;
    }
    return 1;
  }

  /**
   * Check if no results message is displayed
   */
  async isNoResultsMessageDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.noResultsMessage);
  }

  /**
   * Get no results message
   */
  async getNoResultsMessage(): Promise<string> {
    if (await this.isNoResultsMessageDisplayed()) {
      return await this.getText(this.noResultsMessage);
    }
    return '';
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete(): Promise<void> {
    if (await this.isElementVisible(this.loadingSpinner)) {
      await this.waitForElementToBeHidden(this.loadingSpinner);
    }
  }

  /**
   * Wait for properties to load
   */
  async waitForPropertiesToLoad(): Promise<void> {
    await this.waitForElement(this.propertyCards.first(), 15000);
  }

  /**
   * Verify page elements are present
   */
  async verifyPageElements(): Promise<void> {
    await this.waitForElement(this.pageTitle);
    await this.waitForElement(this.propertySearchInput);
    await this.waitForElement(this.searchButton);
  }

  /**
   * Take page screenshot
   */
  async takePageScreenshot(): Promise<void> {
    await this.takeScreenshot('rent-installments-page');
  }

  /**
   * Refresh page
   */
  async refreshPage(): Promise<void> {
    await this.reloadPage();
    await this.verifyPageLoaded();
  }
}

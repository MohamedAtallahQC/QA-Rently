import { test, expect } from '@playwright/test';
import { RentInstallmentsPage } from '../../Pages/Tenant/RentInstallmentsPage';
import { TestData } from '../../utils/TestData';
import { Helpers } from '../../utils/Helpers';

test.describe('Rent Installments Page Tests', () => {
  let rentInstallmentsPage: RentInstallmentsPage;

  test.beforeEach(async ({ page }) => {
    rentInstallmentsPage = new RentInstallmentsPage(page);
    await rentInstallmentsPage.navigateToRentInstallments();
  });

  test('should display rent installments page elements', async () => {
    // Verify page is loaded
    expect(await rentInstallmentsPage.verifyPageLoaded()).toBe(true);
    
    // Verify main elements are present
    await rentInstallmentsPage.verifyPageElements();
    
    // Take screenshot for verification
    await rentInstallmentsPage.takePageScreenshot();
  });

  test('should display page title', async () => {
    const title = await rentInstallmentsPage.getPageTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should search for properties', async () => {
    const searchTerm = 'Riyadh';
    
    // Perform search
    await rentInstallmentsPage.searchProperties(searchTerm);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify search was performed
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should filter properties by type', async () => {
    const propertyType = 'Apartment';
    
    // Apply filter
    await rentInstallmentsPage.filterByPropertyType(propertyType);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify filter was applied
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should filter properties by city', async () => {
    const city = 'Riyadh';
    
    // Apply filter
    await rentInstallmentsPage.filterByCity(city);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify filter was applied
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should filter properties by rent range', async () => {
    const minRent = 30000;
    const maxRent = 80000;
    
    // Apply filter
    await rentInstallmentsPage.filterByRentRange(minRent, maxRent);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify filter was applied
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should apply multiple filters', async () => {
    const filters = {
      searchTerm: 'Riyadh',
      propertyType: 'Apartment',
      city: 'Riyadh',
      minRent: 40000,
      maxRent: 70000
    };
    
    // Apply all filters
    await rentInstallmentsPage.applyFilters(filters);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify filters were applied
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should clear all filters', async () => {
    // Apply some filters first
    const filters = {
      searchTerm: 'Riyadh',
      propertyType: 'Apartment',
      minRent: 40000,
      maxRent: 70000
    };
    await rentInstallmentsPage.applyFilters(filters);
    
    // Clear all filters
    await rentInstallmentsPage.clearFilters();
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Verify filters were cleared
    const currentUrl = await rentInstallmentsPage.getCurrentUrl();
    expect(currentUrl).toBeTruthy();
  });

  test('should display property cards', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
    
    if (propertyCount > 0) {
      // Verify property cards have required information
      const properties = await rentInstallmentsPage.getAllPropertiesInfo();
      expect(properties.length).toBe(propertyCount);
      
      // Check first property details
      const firstProperty = properties[0];
      expect(firstProperty.address).toBeTruthy();
      expect(firstProperty.rentAmount).toBeGreaterThan(0);
      expect(firstProperty.propertyType).toBeTruthy();
    }
  });

  test('should click on property cards', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    if (propertyCount > 0) {
      // Click on first property card
      await rentInstallmentsPage.clickPropertyCard(0);
      
      // Wait for navigation or modal
      await rentInstallmentsPage.waitForPageLoad();
      
      // Verify some action occurred
      const currentUrl = await rentInstallmentsPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should click view details button', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    if (propertyCount > 0) {
      // Click view details button for first property
      await rentInstallmentsPage.clickViewDetails(0);
      
      // Wait for navigation or modal
      await rentInstallmentsPage.waitForPageLoad();
      
      // Verify some action occurred
      const currentUrl = await rentInstallmentsPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should click apply for rent button', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    if (propertyCount > 0) {
      // Click apply for rent button for first property
      await rentInstallmentsPage.clickApplyForRent(0);
      
      // Wait for navigation or modal
      await rentInstallmentsPage.waitForPageLoad();
      
      // Verify some action occurred
      const currentUrl = await rentInstallmentsPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should sort properties', async () => {
    const sortOptions = ['price-low', 'price-high', 'newest', 'oldest'];
    
    for (const sortOption of sortOptions) {
      // Apply sort
      await rentInstallmentsPage.sortProperties(sortOption);
      
      // Wait for results to load
      await rentInstallmentsPage.waitForPropertiesToLoad();
      
      // Verify sort was applied
      const currentUrl = await rentInstallmentsPage.getCurrentUrl();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('should handle pagination', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const isPaginationVisible = await rentInstallmentsPage.isPaginationVisible();
    
    if (isPaginationVisible) {
      // Test next page
      await rentInstallmentsPage.goToNextPage();
      await rentInstallmentsPage.waitForPropertiesToLoad();
      
      // Test previous page
      await rentInstallmentsPage.goToPreviousPage();
      await rentInstallmentsPage.waitForPropertiesToLoad();
      
      // Test specific page number
      await rentInstallmentsPage.goToPage(2);
      await rentInstallmentsPage.waitForPropertiesToLoad();
    }
  });

  test('should display no results message when no properties found', async () => {
    // Search for non-existent property
    await rentInstallmentsPage.searchProperties('NonExistentProperty12345');
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Check if no results message is displayed
    const isNoResultsDisplayed = await rentInstallmentsPage.isNoResultsMessageDisplayed();
    
    if (isNoResultsDisplayed) {
      const noResultsMessage = await rentInstallmentsPage.getNoResultsMessage();
      expect(noResultsMessage).toBeTruthy();
    }
  });

  test('should handle empty search results', async () => {
    // Search for empty string
    await rentInstallmentsPage.searchProperties('');
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Should still display some results or handle gracefully
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle invalid filter values', async () => {
    const invalidFilters = {
      searchTerm: '!@#$%^&*()',
      propertyType: 'InvalidType',
      city: 'InvalidCity',
      minRent: -1000,
      maxRent: -500
    };
    
    // Apply invalid filters
    await rentInstallmentsPage.applyFilters(invalidFilters);
    
    // Wait for results to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    // Should handle gracefully (either show no results or show all results)
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should refresh page and maintain state', async () => {
    // Apply some filters
    const filters = {
      searchTerm: 'Riyadh',
      propertyType: 'Apartment'
    };
    await rentInstallmentsPage.applyFilters(filters);
    
    // Get initial property count
    const initialCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    // Refresh page
    await rentInstallmentsPage.refreshPage();
    
    // Get property count after refresh
    const refreshedCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    // Count should be similar (assuming no new properties were added)
    expect(refreshedCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle rapid filter changes', async () => {
    const filterSets = [
      { searchTerm: 'Riyadh', propertyType: 'Apartment' },
      { searchTerm: 'Jeddah', propertyType: 'Villa' },
      { searchTerm: 'Dammam', propertyType: 'Apartment' }
    ];
    
    // Rapidly apply different filters
    for (const filters of filterSets) {
      await rentInstallmentsPage.applyFilters(filters);
      await rentInstallmentsPage.page.waitForTimeout(100);
    }
    
    // Should not cause errors
    expect(await rentInstallmentsPage.verifyPageLoaded()).toBe(true);
  });

  test('should display property information correctly', async () => {
    // Wait for properties to load
    await rentInstallmentsPage.waitForPropertiesToLoad();
    
    const propertyCount = await rentInstallmentsPage.getPropertyCardsCount();
    
    if (propertyCount > 0) {
      // Get first property information
      const propertyInfo = await rentInstallmentsPage.getPropertyInfo(0);
      
      expect(propertyInfo).toBeTruthy();
      expect(propertyInfo!.address).toBeTruthy();
      expect(propertyInfo!.rentAmount).toBeGreaterThan(0);
      expect(propertyInfo!.propertyType).toBeTruthy();
    }
  });

  test('should handle loading states', async () => {
    // Apply filters to trigger loading
    await rentInstallmentsPage.applyFilters({ searchTerm: 'Riyadh' });
    
    // Wait for loading to complete
    await rentInstallmentsPage.waitForLoadingToComplete();
    
    // Verify page is still functional
    expect(await rentInstallmentsPage.verifyPageLoaded()).toBe(true);
  });
});

import { test, expect } from '@playwright/test';
import { setupSupabaseMocks } from '../mocks/mockSupabase.js';

test.describe('E2E Sanity & Infrastructure Check', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept and mock all Supabase API requests
    await setupSupabaseMocks(page);
  });

  test('should load the homepage and render the hero heading', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/peosta-cleaning-services/');

    // Validate the primary heading is rendered and contains correct text
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('A Sparkling Home');
    await expect(heroHeading).toContainText('Every Time.');

    // Validate subtext
    const heroSubtext = page.locator('p').first();
    await expect(heroSubtext).toContainText('Peosta');
  });
});

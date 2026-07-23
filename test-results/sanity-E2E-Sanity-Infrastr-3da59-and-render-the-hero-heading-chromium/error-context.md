# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sanity.spec.js >> E2E Sanity & Infrastructure Check >> should load the homepage and render the hero heading
- Location: tests/e2e/sanity.spec.js:10:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1').filter({ hasText: 'A Sparkling Home' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1').filter({ hasText: 'A Sparkling Home' })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupSupabaseMocks } from '../mocks/mockSupabase.js';
  3  |
  4  | test.describe('E2E Sanity & Infrastructure Check', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     // Intercept and mock all Supabase API requests
  7  |     await setupSupabaseMocks(page);
  8  |   });
  9  |
  10 |   test('should load the homepage and render the hero heading', async ({ page }) => {
  11 |     // Navigate to the base URL
  12 |     await page.goto('./');
  13 |
  14 |     // Validate the primary heading is rendered and contains correct text
  15 |     const heroHeading = page.locator('h1').filter({ hasText: 'A Sparkling Home' });
> 16 |     await expect(heroHeading).toBeVisible();
     |                               ^ Error: expect(locator).toBeVisible() failed
  17 |     await expect(heroHeading).toContainText('A Sparkling Home');
  18 |     await expect(heroHeading).toContainText('Every Time.');
  19 |
  20 |     // Validate subtext
  21 |     const heroSubtext = page.locator('p').first();
  22 |     await expect(heroSubtext).toContainText('Peosta');
  23 |   });
  24 | });
  25 |
```
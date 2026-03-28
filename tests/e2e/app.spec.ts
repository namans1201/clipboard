import { test, expect, type Page } from '@playwright/test';

// Get test credentials from environment variables
const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

// Skip tests if credentials not configured
const shouldSkipAuthTests = !TEST_EMAIL || !TEST_PASSWORD;

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL!);
  await page.fill('input[type="password"]', TEST_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL((url) => url.pathname === '/', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test.describe('Authentication', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test.skip(shouldSkipAuthTests, 'should allow login with valid credentials', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Clip Management', () => {
  test.skip(shouldSkipAuthTests);

  test.beforeEach(async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/');
  });

  test('should create a new clip', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click New Clip button
    await page.getByRole('button', { name: /new clip/i }).click();
    
    // Wait for dialog
    await page.waitForSelector('textarea', { state: 'visible' });
    
    // Fill in clip content
    await page.fill('textarea', 'Test clip content from E2E');
    
    // Save
    await page.getByRole('button', { name: /create clip/i }).click();
    
    // Should show success toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });

  test('should delete and restore clip', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if clips exist
    const clipCards = page.getByTestId('clip-card');
    const clipCount = await clipCards.count();
    
    // If no clips, create one first
    if (clipCount === 0) {
      await page.getByRole('button', { name: /new clip/i }).click();
      await page.waitForSelector('textarea', { state: 'visible' });
      await page.fill('textarea', 'Test clip for deletion');
      await page.getByRole('button', { name: /create clip/i }).click();
      // Wait for optimistic update
      await page.waitForTimeout(500);
    }
    
    const firstClip = clipCards.first();
    await firstClip.waitFor({ state: 'visible' });
    
    // On mobile, buttons are always visible, on desktop need hover
    if (page.viewportSize()!.width >= 640) {
      await firstClip.hover();
    }
    
    // Click delete button
    await firstClip.locator('button[title*="Delete"]').first().click();
    
    // Should show toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
    
    // Navigate to trash
    if (page.viewportSize()!.width < 768) {
      await page.getByRole('button', { name: /open navigation menu/i }).click();
    }
    await page.getByRole('link', { name: /trash/i }).click();
    
    // Wait for trash page
    await page.waitForURL('/trash');
    await page.waitForLoadState('networkidle');
    
    // Should have at least one clip
    await expect(page.getByTestId('clip-card').first()).toBeVisible();
  });
});

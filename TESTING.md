# Testing Guide

## Prerequisites

Before running tests, you need:
1. **Test user account** in your Supabase database
2. **Test credentials** configured in `.env.test`
3. **Playwright browsers** installed

## Quick Setup

### 1. Create Test User in Supabase

**Option A: Via Supabase Dashboard (Easiest)**
1. Go to your Supabase project
2. Navigate to **Authentication** > **Users**
3. Click **Add user** > **Create new user**
4. Enter:
   - Email: `test@example.com` (or your preferred test email)
   - Password: `testpassword` (or your preferred test password)
   - ✅ Check "Auto Confirm User"
5. Click **Create user**

**Option B: Via SQL Editor**
```sql
-- In Supabase SQL Editor, run:
-- This creates a test user with email: test@example.com, password: testpassword

-- First, get the auth schema
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('testpassword', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  '',
  '',
  ''
);
```

> **Note**: If SQL approach doesn't work, use Dashboard method (Option A) - it's simpler!

### 2. Configure Test Credentials

Create a `.env.test` file:

```bash
# Copy the example file
cp .env.test.example .env.test

# Edit .env.test with your test credentials
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword
```

**Important**: Use the same credentials you created in Step 1!

### 3. Install Playwright Browsers

First time only:
```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers (~500MB).

---

## Running Tests

### Run All Tests (Headless)
```bash
npm run test:e2e
```

**Expected Output:**
```
Running 4 tests using 2 workers

  ✓ Authentication › should redirect unauthenticated users to login (1.2s)
  ✓ Authentication › should allow login with valid credentials (3.5s)
  ✓ Clip Management › should create a new clip (4.2s)
  ✓ Clip Management › should delete and restore clip (5.1s)

  4 passed (14s)
```

### Run Tests with UI (Interactive)
```bash
npm run test:e2e:ui
```

Opens Playwright UI where you can:
- See tests running in real-time
- Click through each step
- Debug failures
- Take screenshots

---

## Test Coverage

### ✅ Authentication (2 tests)
- **Unauthenticated redirect** - Always runs (no credentials needed)
- **Valid login** - Requires `.env.test` configuration

### ✅ Clip Management (2 tests)
- **Create clip** - Tests create dialog and optimistic updates
- **Delete and restore** - Tests soft delete and trash functionality

**Note**: Tests that require authentication will be automatically **skipped** if `.env.test` is not configured. You'll see:

```
  ○ Authentication › should allow login with valid credentials (skipped)
  ○ Clip Management › should create a new clip (skipped)
```

This is intentional! Just configure `.env.test` to enable these tests.

### Run Specific Test
```bash
npx playwright test -g "should create a new clip"
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

Pauses at each step, lets you inspect page state.

---

## Test Coverage

### ✅ Authentication (4 tests)
- Unauthenticated redirect
- Valid login
- Invalid login (error handling)
- Public device mode

### ✅ Clip Management (6 tests)
- Create clip
- Edit clip
- Pin clip
- Delete clip (soft delete)
- Restore from trash
- Permanent delete

### ✅ Group Management (2 tests)
- Create group
- Delete group (atomic)

### ✅ Responsive Design (3 tests)
- Hamburger menu visibility
- Mobile menu open/close
- Grid columns on different sizes

### ✅ Keyboard Accessibility (2 tests)
- Navigate clips with keyboard
- Navigate sidebar with keyboard

---

## CI/CD Integration

### GitHub Actions Example

`.github/workflows/test.yml`:
```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Vercel Integration

Add to `vercel.json`:
```json
{
  "buildCommand": "npm run build && npm run test:e2e",
  "ignoreCommand": "git diff HEAD^ HEAD --quiet ."
}
```

This runs tests before deployment!

---

## Debugging Failed Tests

### 1. View HTML Report
```bash
npx playwright show-report
```

Opens interactive report with:
- Screenshots at failure point
- Video recordings
- Console logs
- Network activity

### 2. Run Failed Tests Only
```bash
npx playwright test --last-failed
```

### 3. Slow Down Test Execution
```bash
npx playwright test --slow-mo=1000
```

Adds 1 second delay between actions.

### 4. Headed Mode (See Browser)
```bash
npx playwright test --headed
```

Shows actual browser window.

---

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Runs before each test
  test.beforeEach(async ({ page }) => {
    // Setup (e.g., login)
  });

  test('should do something', async ({ page }) => {
    // 1. Arrange: Navigate to page
    await page.goto('/');
    
    // 2. Act: Perform action
    await page.click('text=Button');
    
    // 3. Assert: Verify result
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Common Actions
```typescript
// Click
await page.click('text=Button');
await page.click('button[type="submit"]');

// Fill input
await page.fill('input[type="email"]', 'test@example.com');

// Check checkbox
await page.check('input[type="checkbox"]');

// Hover
await page.hover('.clip-card');

// Keyboard
await page.keyboard.press('Enter');
await page.keyboard.type('Hello');

// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for element
await page.waitForSelector('text=Loaded');
```

### Common Assertions
```typescript
// Visibility
await expect(page.locator('text=Hello')).toBeVisible();
await expect(page.locator('text=Hello')).toBeHidden();

// Text content
await expect(page.locator('h1')).toHaveText('Title');
await expect(page.locator('h1')).toContainText('Tit');

// Count
await expect(page.locator('.clip-card')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');

// Attributes
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toHaveValue('test');
```

---

## Best Practices

### 1. Use Data Attributes for Test Selectors
```tsx
// Component
<button data-testid="create-clip-btn">Create</button>

// Test
await page.click('[data-testid="create-clip-btn"]');
```

### 2. Wait for API Responses
```typescript
await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/clips')),
  page.click('text=Save')
]);
```

### 3. Clean Up After Tests
```typescript
test.afterEach(async ({ page }) => {
  // Delete created data
  await page.evaluate(() => localStorage.clear());
});
```

### 4. Use Page Object Model (POM)
```typescript
// pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// test
const loginPage = new LoginPage(page);
await loginPage.login('test@example.com', 'testpassword');
```

---

## Troubleshooting

### Issue: "Browser not found"
```bash
# Solution: Install browsers
npx playwright install
```

### Issue: "Test timeout"
```typescript
// Increase timeout
test.setTimeout(60000); // 60 seconds
```

### Issue: "Element not found"
```typescript
// Add explicit wait
await page.waitForSelector('text=Element', { timeout: 5000 });
```

### Issue: "Flaky tests"
```typescript
// Use auto-waiting
await expect(page.locator('text=Success')).toBeVisible();
// NOT: await page.waitForTimeout(1000) ❌
```

---

## Performance Tips

### 1. Run Tests in Parallel
```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4, // Run 4 tests simultaneously
});
```

### 2. Reuse Authentication
```typescript
// auth.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'testpassword');
  await page.click('button[type="submit"]');
  await page.context().storageState({ path: 'auth.json' });
});

// playwright.config.ts
export default defineConfig({
  use: {
    storageState: 'auth.json', // Reuse login state
  },
});
```

### 3. Skip Unnecessary Tests in CI
```typescript
test.skip(process.env.CI, 'Skip in CI');
```

---

## Summary

✅ **15 E2E tests** covering critical paths
✅ **Easy to run**: `npm run test:e2e`
✅ **CI/CD ready**: GitHub Actions, Vercel
✅ **Interactive debugging**: Playwright UI
✅ **Production-grade**: Catch regressions early

Happy testing! 🧪

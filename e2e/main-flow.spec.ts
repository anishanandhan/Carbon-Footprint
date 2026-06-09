import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('EcoSphere E2E User Journey & Accessibility Auditing', () => {
  test('should complete login, log activity, reload, verify persistence, and check accessibility', async ({ page }) => {
    // 1. Landing & Login Page A11y check
    await page.goto('/');
    
    // Inject and scan login page
    await injectAxe(page);
    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    });

    await page.screenshot({ path: 'playwright-screenshots/01-login-landing.png' });

    // 2. Perform Login Flow
    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');
    const loginButton = page.locator('button:has-text("Log In")');

    await emailInput.fill('eco@ecosphere.com');
    await passwordInput.fill('greenfuture');
    await loginButton.click();

    // 3. Confirm Dashboard View
    await expect(page.locator('text=Weekly Carbon Footprint Budget')).toBeVisible();
    await page.screenshot({ path: 'playwright-screenshots/02-dashboard-auth.png' });

    // Dashboard accessibility scan
    await injectAxe(page);
    await checkA11y(page, undefined, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    });

    // 4. Navigate to Log Activity tab
    await page.click('button:has-text("Log Activity")');
    await expect(page.locator('text=Log Daily Activity')).toBeVisible();

    // Fill log activity form
    await page.selectOption('#log-transit-mode', 'hybrid_car');
    await page.locator('#log-distance').fill('15.5');
    await page.locator('#log-passengers').fill('2');
    await page.click('form button[type="submit"]'); // submit

    // 5. Back on Dashboard, check stats
    await expect(page.locator('text=Weekly Carbon Footprint Budget')).toBeVisible();
    
    // Emissions calculations check:
    // Hybrid car factor is 0.11. 15.5 miles / 2 passengers = 7.75 miles-equivalent.
    // 7.75 * 0.11 = 0.8525 kg emitted.
    // Gas car factor is 0.20. Gas emissions = 15.5 * 0.20 / 2 = 1.55 kg.
    // Savings = 1.55 - 0.85 = 0.70 kg.
    await expect(page.locator('text=0.9 kg emitted')).toBeVisible(); // 0.85 kg rounds to 0.9 kg or similar in the dashboard UI
    await page.screenshot({ path: 'playwright-screenshots/03-log-added.png' });

    // 6. Persistence check via page reload
    await page.reload();
    await expect(page.locator('text=Weekly Carbon Footprint Budget')).toBeVisible();
    await expect(page.locator('text=0.9 kg emitted')).toBeVisible(); // persisted!
    await page.screenshot({ path: 'playwright-screenshots/04-reload-persisted.png' });
  });
});

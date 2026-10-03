import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('SameWindow public regression suite', () => {
  test('invalid sign-in shows an accessible error', async ({ page }) => {
    await page.goto('/signin');
    await page.getByLabel('Email').fill(`invalid-${Date.now()}@example.invalid`);
    await page.getByLabel('Password').fill('definitely-invalid-password');
    await page.getByRole('main').getByRole('button', { name: 'Sign In' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/invalid login credentials|authentication failed/i);
    await expect(page.getByLabel('Password')).toHaveValue('definitely-invalid-password');
    await expect(page.getByRole('main').getByRole('button', { name: 'Sign In' })).toBeEnabled();
    await expect(page.getByLabel('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  test('signed-out pricing uses neutral CTAs', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Get Started with Developer')).toBeVisible();
    await expect(page.getByText('Current Plan')).toHaveCount(0);
  });

  test('unknown routes render explicit not-found states', async ({ page }) => {
    await page.goto('/blog/not-a-real-article');
    await expect(page.getByText('404 / ARTICLE NOT FOUND')).toBeVisible();

    await page.goto('/nonexistent-qa-route');
    await expect(page.getByText('404 / PAGE NOT FOUND')).toBeVisible();
  });

  test('docs and homepage remain horizontally contained on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/');
    const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(homeOverflow).toBeFalsy();
    await expect(page.getByText('Customer Support Agent')).toBeVisible();

    await page.goto('/docs');
    const docsOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(docsOverflow).toBeFalsy();
  });
});

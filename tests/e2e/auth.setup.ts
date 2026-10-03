import { test as setup, expect } from '@playwright/test';
import fs from 'node:fs';

const authFile = 'playwright/.auth/user.json';

setup('authenticate test account', async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error('Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD before running authenticated tests.');
  }

  await page.goto('/signin');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('main').getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard(?:\/|$)/);
  await expect(page.getByText('Agent Fleet', { exact: false }).first()).toBeVisible();

  fs.mkdirSync('playwright/.auth', { recursive: true });
  await page.context().storageState({ path: authFile });
});

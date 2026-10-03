import { test, expect } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('SameWindow authenticated regression suite', () => {
  test('dashboard loads with a valid authenticated session', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard(?:\/|$)/);
    await expect(page.getByText('Agent Fleet', { exact: false }).first()).toBeVisible();
  });

  test('projects page lists projects and full UUIDs', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByText('Agent Fleet Projects')).toBeVisible();

    const ids = page.locator('span[title]');
    await expect(ids.first()).toBeVisible();
    const title = await ids.first().getAttribute('title');
    expect(title).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  test('creating a project immediately opens its runs page', async ({ page }) => {
    const projectName = `Playwright QA ${Date.now()}`;

    await page.goto('/projects');
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByLabel('Project Name').fill(projectName);
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\/runs$/i);
    await expect(page.getByText('No matching agent runs found.')).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\/runs$/i);
  });

  test('project settings survives navigation and refresh', async ({ page }) => {
    await page.goto('/projects');
    const projectCard = page.locator('div').filter({ hasText: /^sai$/ }).first();
    if (await projectCard.count()) {
      await projectCard.getByRole('button', { name: /Select Project|Active Fleet/ }).click();
    } else {
      await page.getByRole('button', { name: /Select Project|Active Fleet/ }).first().click();
    }

    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\/runs$/i);
    const projectId = page.url().match(/\/projects\/([0-9a-f-]+)\/runs$/i)?.[1];
    expect(projectId).toBeTruthy();

    await page.goto(`/projects/${projectId}/settings`);
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/settings$`));
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/projects/${projectId}/settings$`));
  });

  test('direct dashboard and article routes survive refresh', async ({ page }) => {
    await page.goto('/dashboard');
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard(?:\/|$)/);

    await page.goto('/blog');
    await expect(page.getByText(/SameWindow/i).first()).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(/\/blog(?:\/|$)/);
  });

  test('logout returns to public/authenticated boundary', async ({ page }) => {
    await page.goto('/dashboard');
    const signOut = page.getByRole('button', { name: /sign out|logout/i }).first();
    await expect(signOut).toBeVisible();
    await signOut.click();
    await expect(page).toHaveURL(/\/$|\/signin$/);
  });
});

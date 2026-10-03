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

  test('real SDK ingestion reaches the production Runs UI', async ({ page }) => {
    const projectName = `Ingestion QA ${Date.now()}`;
    const agentName = `Playwright Ingestion Agent ${Date.now()}`;

    await page.goto('/projects');
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.getByLabel('Project Name').fill(projectName);
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+\/runs$/i);
    const projectId = page.url().match(/\/projects\/([0-9a-f-]+)\/runs$/i)?.[1];
    expect(projectId).toBeTruthy();

    await page.goto('/api-keys');
    await expect(page.getByText('API Ingestion Keys')).toBeVisible();
    await page.getByRole('button', { name: 'Create New Key' }).click();
    await page.getByPlaceholder('e.g. Production Ingest Agent Worker').fill('Playwright E2E Ingestion');
    await page.getByRole('button', { name: 'Generate Key' }).click();

    const secret = await page.locator('span.select-all').textContent();
    expect(secret).toMatch(/^sw_live_[0-9a-f]+$/);

    const runId = `playwright_${Date.now()}`;
    const response = await page.request.post('/api/ingest', {
      headers: {
        Authorization: `Bearer ${secret!.trim()}`,
        'X-Project-Id': projectId!,
      },
      data: {
        runs: [{
          id: runId,
          agentName,
          status: 'SUCCESS',
          startedAt: new Date(Date.now() - 250).toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: 250,
          model: 'playwright-test-model',
          environment: 'production',
          inputTokens: 12,
          outputTokens: 8,
          totalTokens: 20,
          estimatedCost: 0.00005,
          events: [{
            id: `event_${Date.now()}`,
            type: 'USER_INPUT',
            title: 'Playwright E2E Input',
            status: 'OK',
            timestamp: new Date(Date.now() - 200).toISOString(),
            offsetMs: 50,
            data: { userInput: 'E2E ingestion verification' },
          }, {
            id: `event_model_${Date.now()}`,
            type: 'MODEL_CALL',
            title: 'Model: playwright-test-model',
            status: 'OK',
            timestamp: new Date(Date.now() - 100).toISOString(),
            offsetMs: 150,
            durationMs: 100,
            data: {
              modelCall: {
                model: 'playwright-test-model',
                inputTokens: 12,
                outputTokens: 8,
                responsePreview: 'E2E ingestion verified',
              },
            },
          }, {
            id: `event_final_${Date.now()}`,
            type: 'FINAL_RESPONSE',
            title: 'Final Response',
            status: 'OK',
            timestamp: new Date().toISOString(),
            offsetMs: 250,
            data: { finalResponse: 'E2E ingestion verified' },
          }],
        }],
      },
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, persisted: true, ingested: 1 });

    await page.goto(`/projects/${projectId}/runs`);
    await expect(page.getByText(agentName, { exact: false })).toBeVisible();
    await expect(page.getByText('SUCCESS', { exact: false }).first()).toBeVisible();
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

import { test, expect } from '../../support/fixtures';
import { credentials, messages } from '../../support/data';
import { LoginPage } from '../../pages/login.page';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.expectLoaded();
  });

  test('UI-01 | valid user can log in and log out', { tag: '@smoke' }, async ({ page }) => {
    const login = new LoginPage(page);
    await test.step('Log in with valid credentials', async () => {
      await login.login(credentials.valid.username, credentials.valid.password);
    });

    await test.step('Verify the authenticated state', async () => {
      await expect(page).toHaveURL(/\/secure$/);
      await expect(login.flash).toContainText(messages.loginSuccess);
      await expect(login.logoutButton).toBeVisible();
    });

    await test.step('Log out and verify the anonymous state', async () => {
      await login.logout();
      await expect(page).toHaveURL(/\/login$/);
      await expect(login.flash).toContainText(messages.logoutSuccess);
    });
  });

  for (const scenario of [
    { id: 'UI-02', name: 'invalid username', ...credentials.invalidUsername },
    { id: 'UI-03', name: 'invalid password', ...credentials.invalidPassword },
  ]) {
    test(`${scenario.id} | rejects ${scenario.name}`, async ({ page }) => {
      const login = new LoginPage(page);
      await test.step(`Submit an ${scenario.name}`, async () => {
        await login.login(scenario.username, scenario.password);
      });
      await test.step('Verify access is denied and the login form remains available', async () => {
        await expect(page).toHaveURL(/\/login$/);
        await expect(login.flash).toBeVisible();
        await expect(login.flash).toContainText(messages.invalidCredentials);
        await expect(login.logoutButton).toHaveCount(0);
        await login.expectLoaded();
      });
    });
  }
});

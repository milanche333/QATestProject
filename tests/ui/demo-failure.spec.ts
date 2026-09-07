import { test, expect } from '../../support/fixtures';
import { LoginPage } from '../../pages/login.page';
import { credentials, messages } from '../../support/data';

test.describe('Intentional UI failure demonstration', () => {
  test(
    'DEMO-UI-01 | intentional mismatch in the login success message',
    {
      tag: '@demo-failure',
      annotation: {
        type: 'intentional-failure',
        description:
          'The final assertion deliberately expects incorrect copy to demonstrate a failed assertion, screenshot and trace. This is not a product defect.',
      },
    },
    async ({ page }) => {
      const login = new LoginPage(page);

      await test.step('Establish a real successful login', async () => {
        await login.open();
        await login.expectLoaded();
        await login.login(credentials.valid.username, credentials.valid.password);
        await expect(page).toHaveURL(/\/secure$/);
        await expect(login.flash).toContainText(messages.loginSuccess);
      });

      await test.step('DELIBERATE FAILURE: compare the success message with incorrect copy', async () => {
        await expect(
          login.flash,
          'Demo only: intentionally incorrect expected success message',
        ).toContainText('Welcome to your QA portfolio!');
      });
    },
  );
});
